#!/bin/bash

echo "🚀 WATCHDOG DEVOPS STACK: STARTING ALL SERVICES..."

# 1. Purane kachre ko saaf karo
echo "🧹 Cleaning up busy ports (3010, 8000, 8888)..."
sudo killall kubectl 2>/dev/null
sudo fuser -k 3010/tcp 8000/tcp 8888/tcp 2>/dev/null

# 2. IP nikaalo (Browser mein yahi dalna padega)
WSL_IP=$(hostname -I | awk '{print $1}')
echo "🔗 Your WSL IP: $WSL_IP"

# 3. Frontend Pod ka naam automatically dhundo
FRONTEND_POD=$(kubectl get pods -l app.kubernetes.io/name=watchdog-frontend-ai-app-chart -o jsonpath="{.items[0].metadata.name}")
echo "📦 Frontend Pod: $FRONTEND_POD"

# 4. STARTING ALL TUNNELS (Background mein)
echo "------------------------------------------------------"

# A. Frontend (Port 3010)
echo "🎯 Forwarding Frontend... (Port 3010)"
kubectl port-forward --address 0.0.0.0 pod/$FRONTEND_POD 3010:3000 > /dev/null 2>&1 &

# B. Backend (Port 8000)
echo "⚙️ Forwarding Backend... (Port 8000)"
kubectl port-forward --address 0.0.0.0 svc/watchdog-backend-ai-app-chart 8000:8000 > /dev/null 2>&1 &

# C. ArgoCD (Port 8888)
echo "🚢 Forwarding ArgoCD... (Port 8888)"
kubectl port-forward --address 0.0.0.0 svc/argocd-server -n argocd 8888:443 > /dev/null 2>&1 &

# 5. FINAL DASHBOARD
echo "------------------------------------------------------"
echo "✅ EVERYTHING IS LIVE! Open these in your browser:"
echo "🌐 FRONTEND:  http://$WSL_IP:3010"
echo "🧠 BACKEND:   http://$WSL_IP:8000/docs"
echo "🚢 ARGOCD:    https://$WSL_IP:8888"
echo "------------------------------------------------------"
echo "💡 Note: ArgoCD might show a 'Privacy Warning', just click 'Advanced' and 'Proceed'."
echo "💡 Keep this terminal OPEN during the entire demo."