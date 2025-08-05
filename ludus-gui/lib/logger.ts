import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Allow override of log level via environment variable
const getLogLevel = () => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  return isTest ? 'silent' : isDevelopment ? 'debug' : 'info';
};

export const logger = pino({
  level: getLogLevel(),
  transport: (isDevelopment || process.env.LOG_LEVEL) && !isTest && typeof window !== 'undefined' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '{context}: {msg}',
      singleLine: false,      // Multi-line for better readability
      hideObject: false,      // Show structured data
      customPrettifiers: {
        yamlContent: (value: string) => `\n--- YAML START ---\n${value}\n--- YAML END ---`,
        config: (value: unknown) => `\n${JSON.stringify(value, null, 2)}`,
        largeObject: (value: unknown) => {
          const str = JSON.stringify(value, null, 2);
          return str.length > 1000 
            ? `\n${str.substring(0, 1000)}...\n[Truncated: ${str.length} chars total]`
            : `\n${str}`;
        }
      }
    }
  } : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  },
  // In production, redact sensitive fields
  ...(process.env.NODE_ENV === 'production' && {
    redact: ['password', 'token', 'key', 'secret']
  })
});

// Context-specific loggers
export const apiLogger = logger.child({ context: 'API' });
export const hookLogger = logger.child({ context: 'HOOK' });
export const componentLogger = logger.child({ context: 'COMPONENT' });
export const utilLogger = logger.child({ context: 'UTIL' });

// Helper functions for common logging patterns
export const logApiRequest = (method: string, endpoint: string, data?: unknown) => {
  apiLogger.info({ method, endpoint, hasData: !!data }, 'API request');
};

export const logApiResponse = (method: string, endpoint: string, status: number, error?: Error) => {
  if (error) {
    apiLogger.error({ method, endpoint, status, error: error.message }, 'API request failed');
  } else {
    apiLogger.info({ method, endpoint, status }, 'API request completed');
  }
};

export const logUserAction = (action: string, component: string, data?: unknown) => {
  componentLogger.info({ action, component, data }, 'User action');
};

export const logError = (error: Error, context: string, metadata?: Record<string, unknown>) => {
  logger.error({ 
    error: error.message, 
    stack: error.stack, 
    context, 
    ...metadata 
  }, 'Error occurred');
};

// Enhanced logging functions for better development experience

export const logYAML = (context: string, yamlContent: string, metadata?: Record<string, unknown>) => {
  utilLogger.info({ 
    context,
    yamlContent,
    yamlLength: yamlContent.length,
    yamlLines: yamlContent.split('\n').length,
    ...metadata 
  }, 'YAML Configuration');
  
  // Browser-friendly copy-paste output in development
  if (isDevelopment && typeof window !== 'undefined') {
    console.group(`📄 ${context} - Full YAML (right-click to copy)`);
    console.log('%c' + yamlContent, 'font-family: monospace; white-space: pre; line-height: 1.4;');
    console.groupEnd();
  }
};


export const logObject = (context: string, obj: unknown, options: {
  preview?: boolean;
  metadata?: Record<string, unknown>;
} = {}) => {
  const { preview = true, metadata } = options;
  
  utilLogger.info({ 
    context, 
    objectKeys: obj ? Object.keys(obj) : [],
    objectType: Array.isArray(obj) ? 'array' : typeof obj,
    objectSize: obj ? JSON.stringify(obj).length : 0,
    data: obj,
    ...metadata 
  }, 'Object Debug');
  
  if (preview && isDevelopment && typeof window !== 'undefined') {
    console.group(`📋 ${context} - Copy-friendly format`);
    console.log(JSON.stringify(obj, null, 2));
    console.groupEnd();
  }
};

// Create bound logger to preserve source attribution
const createBoundLogger = () => {
  if (!isDevelopment || typeof window === 'undefined') {
    return {
      yaml: () => {},
      object: () => {},
      separator: () => {},
      success: () => {},
      error: () => {}
    };
  }

  // Create bound console methods once for correct source attribution
  const boundGroup = console.group.bind(console);
  const boundLog = console.log.bind(console);
  const boundGroupEnd = console.groupEnd.bind(console);

  return {
    yaml: (context: string, yamlContent: string, metadata?: Record<string, unknown>) => {
      // Keep structured pino logging
      utilLogger.info({ 
        context,
        yamlLength: yamlContent.length,
        yamlLines: yamlContent.split('\n').length,
        ...metadata 
      }, 'YAML Configuration');
      
      // Use bound methods for correct source attribution
      boundGroup(`📄 ${context} - Full YAML (right-click to copy)`);
      boundLog('%c' + yamlContent, 'font-family: monospace; white-space: pre; line-height: 1.4;');
      console.trace('Called from:');
      boundGroupEnd();
    },
    
    object: (context: string, obj: unknown, metadata?: Record<string, unknown>) => {
      // Keep structured pino logging
      utilLogger.info({ 
        context, 
        objectKeys: obj ? Object.keys(obj) : [],
        objectType: Array.isArray(obj) ? 'array' : typeof obj,
        objectSize: obj ? JSON.stringify(obj).length : 0,
        data: obj,
        ...metadata 
      }, 'Object Debug');
      
      // Use bound methods for correct source attribution
      boundGroup(`📋 ${context} - Copy-friendly format`);
      boundLog(JSON.stringify(obj, null, 2));
      console.trace('Called from:');
      boundGroupEnd();
    },
    
    separator: (label: string) => {
      boundLog('%c' + `═══ ${label} ═══`, 'color: #2563eb; font-weight: bold; font-size: 14px;');
      console.trace('Called from:');
    },
    
    success: (message: string) => {
      boundLog('%c✅ ' + message, 'color: #16a34a; font-weight: bold;');
      console.trace('Called from:');
    },
    
    error: (message: string) => {
      boundLog('%c❌ ' + message, 'color: #dc2626; font-weight: bold;');
      console.trace('Called from:');
    }
  };
};

// Development logging interface - single entry point with correct source attribution
export const devLog = createBoundLogger();