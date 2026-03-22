#!/bin/bash
echo "🛡️ WATCHDOG DEVOPS STACK: DEPLOYING ALL SYSTEMS..."

# 1. Ports aur purane tunnels saaf karo
echo "🧹 Clearing existing tunnels and ports..."
sudo killall kubectl 2>/dev/null
sudo fuser -k 3010/tcp 8000/tcp 8888/tcp 9090/tcp 3001/tcp 2>/dev/null

# 2. Network aur Resources detect karo
WSL_IP=$(hostname -I | awk '{print $1}')
FRONTEND_POD=$(kubectl get pods -l app.kubernetes.io/name=watchdog-frontend-ai-app-chart -o jsonpath="{.items[0].metadata.name}")
ARGO_NS=$(kubectl get svc -A | grep argocd-server | awk '{print $1}' | head -n 1)

echo "🔗 WSL IP: $WSL_IP"
echo "📦 Found Frontend Pod: $FRONTEND_POD"

# 3. STARTING ALL TUNNELS (Background mein)
echo "🚀 Connecting Tunnels..."

# A. Frontend (Port 3010) - Targetting Port 80 (As per your svc output)
kubectl port-forward --address 0.0.0.0 pod/$FRONTEND_POD 3010:80 > /dev/null 2>&1 &

# B. Backend (Port 8000) - Exact Service Name Match
kubectl port-forward --address 0.0.0.0 svc/watchdog-backend-ai-app-chart 8000:8000 > /dev/null 2>&1 &

# C. ArgoCD (Port 8888)
kubectl port-forward --address 0.0.0.0 svc/argocd-server -n $ARGO_NS 8888:443 > /dev/null 2>&1 &

# D. Prometheus (Port 9090)
kubectl port-forward --address 0.0.0.0 svc/monitoring-kube-prometheus-prometheus -n monitoring 9090:9090 > /dev/null 2>&1 &

# E. Grafana (Port 3001)
kubectl port-forward --address 0.0.0.0 svc/monitoring-grafana -n monitoring 3001:80 > /dev/null 2>&1 &

# 4. FINAL STATUS BOARD
echo "------------------------------------------------------"
echo "✅ ALL SYSTEMS ARE LIVE! Open these URLs:"
echo "🌐 FRONTEND:   http://$WSL_IP:3010"
echo "🧠 BACKEND:    http://$WSL_IP:8000/docs"
echo "🚢 ARGOCD:     https://$WSL_IP:8888"
echo "📊 PROMETHEUS: http://$WSL_IP:9090"
echo "📈 GRAFANA:    http://$WSL_IP:3001"
echo "------------------------------------------------------"
echo "💡 Keep this terminal OPEN. Good luck, Hrishi! Phod de!"