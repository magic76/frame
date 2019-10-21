#######################
# README
#######################

# 1. 第一次部署使用，抓base image
# make docker/image

# 2. 部署 {產品}/{站台}/{環境}
# make tx/eu/alpha

CONTAINER_IMAGE_PATH	:= dkr.ecr.eu-west-1.amazonaws.com
CONTAINER_BASE_IMAGE 	:= dkr.ecr.eu-west-1.amazonaws.com/web:base
CONTAINER_BASE_NAME 	:= web-base
CONTAINER_DEPLOY_NAME   := web-deploy
AWS_ACCOUNT_TX			:= 897520422999

tx/agent/alpha:
	$(MAKE) build/deploy AWS_ACCOUNT=${AWS_ACCOUNT_TX} APP_NAME=tx SERVICE_NAME=agent-web ENV_STAGE=alpha BUILD_NAME=agent
tx/agent/qa:
	$(MAKE) build/deploy AWS_ACCOUNT=${AWS_ACCOUNT_TX} APP_NAME=tx SERVICE_NAME=agent-web ENV_STAGE=qa BUILD_NAME=agent
tx/agent/preprod:
	$(MAKE) build/deploy AWS_ACCOUNT=${AWS_ACCOUNT_TX} APP_NAME=tx SERVICE_NAME=agent-web ENV_STAGE=preprod BUILD_NAME=agent
tx/agent/prod:
	$(MAKE) build/deploy AWS_ACCOUNT=${AWS_ACCOUNT_TX} APP_NAME=tx SERVICE_NAME=agent-web ENV_STAGE=prod BUILD_NAME=agent

build/deploy:
	@$(MAKE) code/build SERVICE_NAME=${BUILD_NAME}
	@$(MAKE) docker/build
	@$(MAKE) docker/install
	@$(MAKE) docker/deploy APP_NAME=${APP_NAME} SERVICE_NAME=${SERVICE_NAME} ENV_STAGE=${ENV_STAGE}

aws/login:
	@echo "[ 正在登入ECR ]"
	@$$(aws ecr get-login --no-include-email --region eu-west-1 --profile ${APP_NAME})

code/build:
	@echo "[ 正在進行建置 ]"
	@yarn
	@yarn build ${BUILD_NAME}|| { echo 'typescript compile error.' ; exit 0; }

docker/image:
	@echo "[ 正在下載映像檔 ]"
	@$(MAKE) aws/login APP_NAME=tx
	@docker pull ${AWS_ACCOUNT_TX}.$(CONTAINER_BASE_IMAGE)
	@echo "[ 映像檔下載完成 ]"

docker/build:
	@echo "[ 正在檢查容器狀態 ]"
ifeq ($(strip $(shell docker ps -q --filter "name=$(CONTAINER_BASE_NAME)" | wc -l)),0)
ifneq ($(strip $(shell docker ps -a --filter "name=$(CONTAINER_BASE_NAME)" | wc -l)),1)
	@docker rm $(CONTAINER_BASE_NAME) -f
endif
	@echo "[ 正在建立容器 ]"
	@docker run -d --name $(CONTAINER_BASE_NAME) ${AWS_ACCOUNT}.$(CONTAINER_BASE_IMAGE)
	@sleep 5
endif
	@echo "Done."

docker/install:
	@echo "[ 正在更新部署檔案 ]"
	@docker exec $(CONTAINER_BASE_NAME) rm /var/www -f -r
	@mkdir -p ../tempnodemoduleAGENT
	@mv node_modules ../tempnodemoduleAGENT/node_modules
	@yarn install --production=true
	@./node_modules/.bin/modclean -r --patterns="default:safe,default:caution"
	@docker cp ./ $(CONTAINER_BASE_NAME):/var/www/
	@docker exec $(CONTAINER_BASE_NAME) rm -rf /var/www/.git/
	@rm -rf node_modules
	@mv ../tempnodemoduleAGENT/node_modules ./node_modules
	@rm -rf ../tempnodemoduleAGENT
	@echo "Done."

docker/deploy:
ifneq ($(ENV_STAGE),)

	@$(MAKE) aws/login APP_NAME=${APP_NAME}

	@echo "[ 正在更新映像檔 ]"
	@docker commit --change "ENV ENV_STAGE $(ENV_STAGE)" $(CONTAINER_BASE_NAME) $(CONTAINER_DEPLOY_NAME)
	@docker tag $(CONTAINER_DEPLOY_NAME) ${AWS_ACCOUNT}.$(CONTAINER_IMAGE_PATH)/$(SERVICE_NAME)-$(ENV_STAGE):hotfix
	@docker tag $(CONTAINER_DEPLOY_NAME) ${AWS_ACCOUNT}.$(CONTAINER_IMAGE_PATH)/$(SERVICE_NAME)-$(ENV_STAGE):latest

ifneq ($(strip $(shell docker images -f "dangling=true" -q)),)
	@echo "[ 正在移除舊版映像檔 ]"
	@docker rmi $$(docker images -f "dangling=true" -q) -f
endif

	@echo "[ 正在進行部署 ]"
	@docker push ${AWS_ACCOUNT}.$(CONTAINER_IMAGE_PATH)/$(SERVICE_NAME)-$(ENV_STAGE):hotfix
	@docker push ${AWS_ACCOUNT}.$(CONTAINER_IMAGE_PATH)/$(SERVICE_NAME)-$(ENV_STAGE):latest

	@echo "[ 正在更新服務 ]"
ifeq ($(ENV_STAGE),prod)
	@aws ecs register-task-definition --family $(SERVICE_NAME)-$(ENV_STAGE) --task-role-arn "ecsTaskExecutionRole" --execution-role-arn "ecsTaskExecutionRole" --requires-compatibilities "FARGATE" --network-mode "awsvpc" --cpu 1024 --memory 2048 --container-definitions '[{"name":"$(SERVICE_NAME)-$(ENV_STAGE)","image":"${AWS_ACCOUNT}.$(CONTAINER_IMAGE_PATH)/$(SERVICE_NAME)-$(ENV_STAGE):hotfix","memory": 2048,"memoryReservation":500,"cpu":1024,"environment":[{"name":"ENV_STAGE","value":"$(ENV_STAGE)"},{"name": "SERVICE_NAME","value":"$(SERVICE_NAME)"},{"name": "APP_NAME","value":"$(APP_NAME)"}],"portMappings":[{"hostPort":80,"protocol":"tcp","containerPort":80}],"logConfiguration":{"logDriver":"awslogs","options":{"awslogs-group":"/ecs/$(SERVICE_NAME)-$(ENV_STAGE)","awslogs-region":"eu-west-1","awslogs-stream-prefix":"ecs"}}}]' --profile ${APP_NAME}
else ifeq ($(ENV_STAGE),preprod)
	@aws ecs register-task-definition --family $(SERVICE_NAME)-$(ENV_STAGE) --task-role-arn "ecsTaskExecutionRole" --execution-role-arn "ecsTaskExecutionRole" --requires-compatibilities "FARGATE" --network-mode "awsvpc" --cpu 1024 --memory 2048 --container-definitions '[{"name":"$(SERVICE_NAME)-$(ENV_STAGE)","image":"${AWS_ACCOUNT}.$(CONTAINER_IMAGE_PATH)/$(SERVICE_NAME)-$(ENV_STAGE):hotfix","memory": 2048,"memoryReservation":500,"cpu":1024,"environment":[{"name":"ENV_STAGE","value":"$(ENV_STAGE)"},{"name": "SERVICE_NAME","value":"$(SERVICE_NAME)"},{"name": "APP_NAME","value":"$(APP_NAME)"}],"portMappings":[{"hostPort":80,"protocol":"tcp","containerPort":80}],"logConfiguration":{"logDriver":"awslogs","options":{"awslogs-group":"/ecs/$(SERVICE_NAME)-$(ENV_STAGE)","awslogs-region":"eu-west-1","awslogs-stream-prefix":"ecs"}}}]' --profile ${APP_NAME}
endif
	@aws ecs update-service --cluster $(ENV_STAGE) --service $(SERVICE_NAME)-$(ENV_STAGE) --task-definition $(SERVICE_NAME)-$(ENV_STAGE) --force-new-deployment --profile ${APP_NAME}

	@echo "[ ${APP_NAME}/$(SERVICE_NAME)-$(ENV_STAGE) 部署完成，請進行驗證 ]"

endif