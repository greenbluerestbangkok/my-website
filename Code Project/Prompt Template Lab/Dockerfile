FROM nginx:alpine

# Copy the main application file
COPY "Prompt Template Lab.html" /usr/share/nginx/html/index.html

# Copy health check file
COPY health.html /usr/share/nginx/html/health

# Copy nginx configuration for better performance
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]