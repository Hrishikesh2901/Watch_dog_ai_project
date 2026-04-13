#!/bin/bash
echo "🛡️ WATCHDOG DEVOPS (MINIKUBE): FINAL ACTIVATION..."

# 1. Ports aur purane tunnels saaf karo (Sudo access check)
echo "🧹 Clearing existing tunnels and ports..."
sudo killall kubectl 2>/dev/null
sudo fuser -k 3010/tcp 8000/tcp 8888/tcp 9090/tcp 3001/tcp 2>/dev/null

# 2. Network aur Resources detect karo
WSL_IP=$(hostname -I | awk '{print $1}')

# NEW: Direct Pod Search (No Labels needed)
FRONTEND_POD=$(kubectl get pods -n default --no-headers -o custom-columns=":metadata.name" | grep "watchdog-frontend" | head -n 1)
BACKEND_SVC="watchdog-backend-ai-app-chart"
ARGO_NS=$(kubectl get svc -A | grep argocd-server | awk '{print $1}' | head -n 1)

echo "🔗 WSL IP: $WSL_IP"
echo "📦 Found Frontend Pod: $FRONTEND_POD"

# Check if pod was found to prevent errors
if [ -z "$FRONTEND_POD" ]; then
    echo "❌ ERROR: Frontend Pod nahi mila! Check 'kubectl get pods'."
    exit 1
fi

# 3. STARTING TUNNELS (Background mein)
echo "🚀 Connecting Tunnels..."

# A. Frontend (Direct Pod Forwarding)
kubectl port-forward --address 0.0.0.0 pod/$FRONTEND_POD 3010:80 > /dev/null 2>&1 &

# B. Backend (Service Match)
kubectl port-forward --address 0.0.0.0 svc/$BACKEND_SVC 8000:8000 > /dev/null 2>&1 &

# C. ArgoCD (Targetting Port 443)
kubectl port-forward --address 0.0.0.0 svc/argocd-server -n $ARGO_NS 8888:443 > /dev/null 2>&1 &

# D. Prometheus & Grafana
kubectl port-forward --address 0.0.0.0 svc/monitoring-kube-prometheus-prometheus -n monitoring 9090:9090 > /dev/null 2>&1 &
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