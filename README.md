# Candidate Follow-Up Tracker

A Next.js application for tracking candidate follow-ups.

## Deployment to Render

### Method 1: Deploy via GitHub Repository

1. Push your code to a GitHub repository
2. Sign up or log in to [Render](https://render.com/)
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Configure your service with the following settings:
   - **Name**: nexttouchpoint (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Click "Create Web Service"

### Method 2: Deploy via render.yaml

1. Make sure the `render.yaml` file is in your repository
2. Sign up or log in to [Render](https://render.com/)
3. Click "New +" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the configuration from render.yaml
6. Review the settings and click "Apply"

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
``` 