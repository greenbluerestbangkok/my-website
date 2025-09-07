# Use nginx to serve static HTML files
FROM nginx:alpine

# Copy the main HTML file
COPY "Prompt Template Lab.html" /usr/share/nginx/html/

# Rename to index.html
RUN mv "/usr/share/nginx/html/Prompt Template Lab.html" /usr/share/nginx/html/index.html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]