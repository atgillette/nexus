// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Add TextEncoder/TextDecoder globals for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock next/cache
jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn),
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Mock TRPC
jest.mock('@nexus/trpc/react', () => ({
  TRPCProvider: ({ children }) => children,
  api: {
    users: {
      listAll: { useQuery: jest.fn() },
      create: { useMutation: jest.fn() },
      update: { useMutation: jest.fn() },
      delete: { useMutation: jest.fn() },
    },
    companies: {
      list: { useQuery: jest.fn() },
    },
  },
}));

// Mock ProfilePicture component to avoid complex imports
jest.mock('@nexus/ui', () => {
  const actual = jest.requireActual('@nexus/ui');
  return {
    ...actual,
    ProfilePicture: jest.fn(() => null),
  };
});

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'