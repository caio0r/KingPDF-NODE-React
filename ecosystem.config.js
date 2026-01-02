module.exports = {
  apps: [
    {
      name: 'kingpdf-backend',
      script: 'python',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 7070',
      cwd: './backend',
      watch: false,
      env: {
        PYTHONUNBUFFERED: '1'
      }
    },
    {
      name: 'kingpdf-frontend',
      // Run the batch starter which invokes Node with the Next CLI (works around Windows/npm shim issues)
      // Launch cmd.exe and pass the batch file as an argument so Windows executes it
      script: 'C:\\Windows\\System32\\cmd.exe',
      args: ['/c', 'start-frontend.bat'],
      cwd: './',
      interpreter: 'none',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0'
      }
    }
  ]
};
