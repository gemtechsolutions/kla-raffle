# Deploy frontend to S3 and invalidate CloudFront for dev/prod.
# Usage:
#   make deploy-dev  S3_BUCKET_DEV=s3://your-dev-bucket  CF_DIST_DEV=DEV123
#   make deploy-prod S3_BUCKET_PROD=s3://your-prod-bucket CF_DIST_PROD=PROD123 [AWS_PROFILE=default]

AWS_PROFILE ?= gemtech
AWS_REGION ?= us-east-1

S3_BUCKET_DEV ?= 
CF_DIST_DEV ?=
S3_BUCKET_PROD ?= kla-raffle-site-cdn-production
CF_DIST_PROD ?= ED677WA8TJKRS

# Normalize S3 bucket values to full s3:// URIs if the prefix is missing
S3_DEV_URI := $(if $(findstring s3://,$(S3_BUCKET_DEV)),$(S3_BUCKET_DEV),s3://$(S3_BUCKET_DEV))
S3_PROD_URI := $(if $(findstring s3://,$(S3_BUCKET_PROD)),$(S3_BUCKET_PROD),s3://$(S3_BUCKET_PROD))

.PHONY: run deploy-dev deploy-prod build-dev build-prod sync-dev sync-prod invalidate-dev invalidate-prod check-dev-vars check-prod-vars

run:
	yarn dev

format:
	yarn format

deploy-dev: build-dev sync-dev invalidate-dev

deploy-prod: build-prod sync-prod invalidate-prod

build-dev:
	yarn build:local

build-prod:
	yarn build:prod

sync-dev: check-dev-vars
	AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) aws s3 sync dist $(S3_DEV_URI) --delete

sync-prod: check-prod-vars
	AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) aws s3 sync dist $(S3_PROD_URI) --delete

invalidate-dev: check-dev-vars
	AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) aws cloudfront create-invalidation --distribution-id $(CF_DIST_DEV) --paths "/*"

invalidate-prod: check-prod-vars
	AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) aws cloudfront create-invalidation --distribution-id $(CF_DIST_PROD) --paths "/*"

check-dev-vars:
	@test -n "$(S3_BUCKET_DEV)" || (echo "S3_BUCKET_DEV is required" && exit 1)
	@test -n "$(CF_DIST_DEV)" || (echo "CF_DIST_DEV is required" && exit 1)

check-prod-vars:
	@test -n "$(S3_BUCKET_PROD)" || (echo "S3_BUCKET_PROD is required" && exit 1)
	@test -n "$(CF_DIST_PROD)" || (echo "CF_DIST_PROD is required" && exit 1)
