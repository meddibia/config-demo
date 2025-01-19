

# test cached requests
for i in {1..100}; do
  curl -X 'GET' \
    'http://localhost:8000/config/tenant123/patient-registration' \
    -H 'accept: application/json'
  echo "Request $i completed"
  sleep 0.1  # Add small delay between requests
done

# test uncached requests
for i in {1..100}; do
  curl -X 'POST' \
    'http://localhost:8000/config/flush-cache' \
    -H 'accept: application/json' \
    -d ''
  echo "cache flushed"

  curl -X 'GET' \
    'http://localhost:8000/config/tenant123/patient-registration' \
    -H 'accept: application/json'
  echo "Request $i completed"
  sleep 0.1  # Add small delay between requests
done
