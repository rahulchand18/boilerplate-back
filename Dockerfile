FROM node:20.11.0
WORKDIR /workspace
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3030