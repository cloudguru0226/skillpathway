#!/bin/bash

# AWS Deployment Script for LMS Production
set -e

echo "🚀 Starting AWS deployment for LMS..."

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPOSITORY_NAME="${ECR_REPOSITORY_NAME:-lms-production}"
ECS_CLUSTER_NAME="${ECS_CLUSTER_NAME:-lms-cluster}"
ECS_SERVICE_NAME="${ECS_SERVICE_NAME:-lms-service}"
TASK_DEFINITION_NAME="${TASK_DEFINITION_NAME:-lms-task}"

# Check required environment variables
required_vars=("AWS_ACCOUNT_ID" "DATABASE_URL" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo "❌ Error: $var is not set"
        exit 1
    fi
done

echo "📋 Configuration:"
echo "  AWS Region: $AWS_REGION"
echo "  ECR Repository: $ECR_REPOSITORY_NAME"
echo "  ECS Cluster: $ECS_CLUSTER_NAME"
echo "  ECS Service: $ECS_SERVICE_NAME"

# Step 1: Build and push Docker image to ECR
echo "🏗️  Building Docker image..."
docker build -f Dockerfile.prod -t lms:latest .

# Get ECR login token
echo "🔐 Authenticating with ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repository if it doesn't exist
echo "📦 Creating ECR repository if needed..."
aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION

# Tag and push image
IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:latest"
echo "🏷️  Tagging image as $IMAGE_URI"
docker tag lms:latest $IMAGE_URI

echo "⬆️  Pushing image to ECR..."
docker push $IMAGE_URI

# Step 2: Run database migrations
echo "🗃️  Running database migrations..."
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV=production \
  $IMAGE_URI npm run migrate

# Step 3: Update ECS task definition
echo "📝 Updating ECS task definition..."
TASK_DEFINITION_JSON=$(cat <<EOF
{
  "family": "$TASK_DEFINITION_NAME",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "lms-app",
      "image": "$IMAGE_URI",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:lms-database-url"
        },
        {
          "name": "SESSION_SECRET",
          "valueFrom": "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:lms-session-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/lms",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:5000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF
)

echo "$TASK_DEFINITION_JSON" > task-definition.json

# Register new task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region $AWS_REGION

# Step 4: Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster $ECS_CLUSTER_NAME \
  --service $ECS_SERVICE_NAME \
  --task-definition $TASK_DEFINITION_NAME \
  --region $AWS_REGION

# Step 5: Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster $ECS_CLUSTER_NAME \
  --services $ECS_SERVICE_NAME \
  --region $AWS_REGION

echo "✅ Deployment completed successfully!"

# Step 6: Get service URL
SERVICE_ARN=$(aws ecs describe-services \
  --cluster $ECS_CLUSTER_NAME \
  --services $ECS_SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].serviceArn' \
  --output text)

LOAD_BALANCER_ARN=$(aws ecs describe-services \
  --cluster $ECS_CLUSTER_NAME \
  --services $ECS_SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].loadBalancers[0].targetGroupArn' \
  --output text 2>/dev/null || echo "No load balancer configured")

echo "📊 Deployment Summary:"
echo "  Service ARN: $SERVICE_ARN"
echo "  Load Balancer: $LOAD_BALANCER_ARN"
echo ""
echo "🎉 Your LMS is now deployed to AWS!"
echo "   Check the ECS console for service status and logs."

# Cleanup
rm -f task-definition.json