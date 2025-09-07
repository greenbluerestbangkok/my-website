# Use nginx to serve static HTML files
FROM nginx:alpine

# Copy the main HTML file
COPY "Prompt Template Lab.html" /usr/share/nginx/html/index.html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]