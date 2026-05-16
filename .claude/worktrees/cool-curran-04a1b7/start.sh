#!/bin/bash
echo "🏠 Starting FinanceHome..."

# Start MongoDB (if not running)
if ! pgrep -x mongod > /dev/null; then
  echo "Starting MongoDB..."
  brew services start mongodb-community 2>/dev/null || mongod --fork --logpath /tmp/mongod.log 2>/dev/null || echo "⚠️  Start MongoDB manually if needed"
fi

# Start server
echo "Starting backend server on port 5000..."
npm run dev &
SERVER_PID=$!

# Start client
echo "Starting React client on port 5173..."
cd client && npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ FinanceHome running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT TERM
wait
