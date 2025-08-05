# Lambdaデプロイ用 Dockerfile
# FROM public.ecr.aws/lambda/nodejs:20
FROM public.ecr.aws/lambda/nodejs:22.2025.08.04.11

# 作業ディレクトリ
WORKDIR /var/task

# ソースコードコピー
COPY . .

# Lambdaエントリーポイント
# CMD ["src/index.handler"]
CMD ["src/lambdaHandler.handler"]
