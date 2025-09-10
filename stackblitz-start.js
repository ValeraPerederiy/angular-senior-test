const { execSync } = require('child_process');

try {
  execSync('ng serve --configuration=stackblitz', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start with StackBlitz configuration:', error.message);
  
  try {
    execSync('ng serve', { stdio: 'inherit' });
  } catch (fallbackError) {
    console.error('Failed to start with development configuration:', fallbackError.message);
    process.exit(1);
  }
}
