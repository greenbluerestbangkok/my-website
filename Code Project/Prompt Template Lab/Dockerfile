FROM nginx:alpine

# Copy the main application file
COPY "Prompt Template Lab.html" /usr/share/nginx/html/index.html

# Copy health check file
COPY health.html /usr/share/nginx/html/health

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]