#!/bin/bash
echo "🛡️ WATCHDOG DEVOPS (MINIKUBE): ULTIMATE FIX FOR DEMO..."

# 1. Purane sabhi hang hue processes ko force kill karo
echo "🧹 Cleaning up all blocked ports..."
sudo killall kubectl 2>/dev/null
sudo fuser -k 3010/tcp 8000/tcp 8888/tcp 9090/tcp 3001/tcp 3000/tcp 2>/dev/null

# 2. Dynamic Pod & Service Detection
WSL_IP=$(hostname -I | awk '{print $1}')

# Sahi Pods aur Services dhundna (Based on your latest 'kubectl get pods')
FRONTEND_POD=$(kubectl get pods --no-headers -o custom-columns=":metadata.name" | grep "watchdog-frontend" | head -n 1)
BACKEND_SVC=$(kubectl get svc --no-headers -o custom-columns=":metadata.name" | grep "watchdog-backend" | head -n 1)
GRAFANA_SVC="prometheus-grafana"  # Jo humne abhi fix kiya
ARGO_NS="argocd"

echo "🔗 WSL IP: $WSL_IP"
echo "📦 Frontend Pod: $FRONTEND_POD"
echo "⚙️ Backend Svc: $BACKEND_SVC"

# Validation check
if [ -z "$FRONTEND_POD" ]; then
    echo "❌ ERROR: Frontend Pod nahi mila! Check 'kubectl get pods'."
    exit 1
fi

# 3. STARTING TUNNELS (Next.js Port 3000 Fix included)
echo "🚀 Igniting DevSecOps Tunnels..."

# A. Frontend: Humne dekha Next.js 3000 pe chal raha hai, toh mapping 3010:3000 hogi
kubectl port-forward --address 0.0.0.0 pod/$FRONTEND_POD 3010:3000 > /dev/null 2>&1 &

# B. Backend: Standard Port 8000
kubectl port-forward --address 0.0.0.0 svc/$BACKEND_SVC 8000:8000 > /dev/null 2>&1 &

# C. ArgoCD: Admin pass: x-DydrJ7Al7jnMql
kubectl port-forward --address 0.0.0.0 svc/argocd-server -n $ARGO_NS 8888:443 > /dev/null 2>&1 &

# D. Monitoring: Grafana pass: admin/admin
kubectl port-forward --address 0.0.0.0 svc/$GRAFANA_SVC -n monitoring 3001:80 > /dev/null 2>&1 &

# 4. FINAL STATUS BOARD
echo "------------------------------------------------------"
echo "✅ DEMO IS LIVE! Use these URLs in your Windows Browser:"
echo "------------------------------------------------------"
echo "🌐 FRONTEND (Portal): http://localhost:3010"
echo "🧠 BACKEND (API):      http://localhost:8000"
echo "🚢 ARGOCD (GitOps):   https://localhost:8888  (Pass: x-DydrJ7Al7jnMql)"
echo "📈 GRAFANA (Metrics):  http://localhost:3001   (Pass: admin)"
echo "------------------------------------------------------"
echo "💡 Note: Browser mein WSL_IP ($WSL_IP) bhi use kar sakte ho."
echo "💡 Tip: Keep this terminal open during the entire demo!"
echo "------------------------------------------------------"
echo "Chalo Hrishi, best of luck for the Final Year project! 🔥"