$url = 'https://tjucpoqxzsolmmceguez.supabase.co/rest/v1/brand_spotlights?select=*'
$key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdWNwb3F4enNvbG1tY2VndWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTQ5NDIsImV4cCI6MjA4NzYzMDk0Mn0.W_LJphCaQb4zjMSP8K9QmLTPMA-gawnaNUrf5m5O49U'
$headers = @{
    'apikey' = $key
    'Authorization' = "Bearer $key"
}

"Starting DB verification..." | Out-File -FilePath "db_log.txt"
try {
    $res = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    "Successfully connected." | Out-File -FilePath "db_log.txt" -Append
    "Record count: $($res.Count)" | Out-File -FilePath "db_log.txt" -Append
    if ($res.Count -gt 0) {
        $res[0] | ConvertTo-Json | Out-File -FilePath "db_log.txt" -Append
    }
} catch {
    "Error occurred: $($_.Exception.Message)" | Out-File -FilePath "db_log.txt" -Append
    $_.ErrorDetails | Out-File -FilePath "db_log.txt" -Append
}
"Done." | Out-File -FilePath "db_log.txt" -Append
