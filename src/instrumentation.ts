export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv, EnvValidationError } = await import('@/lib/env');

    try {
      validateEnv();
      console.log('Runtime environment validation successful');
    } catch (error) {
      if (error instanceof EnvValidationError) {
        console.error(error.getFormattedMessage());
      } else {
        console.error('Runtime environment validation error:', error);
      }
      throw error;
    }
  }
}

