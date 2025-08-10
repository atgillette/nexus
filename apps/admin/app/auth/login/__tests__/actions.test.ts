/**
 * @jest-environment node
 */

import { adminLogin } from '../actions'
import { createClient } from '@nexus/auth/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Mock the dependencies
jest.mock('@nexus/auth/supabase/server')
jest.mock('next/cache')
jest.mock('next/navigation')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('adminLogin Server Action', () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  describe('successful login', () => {
    it('should authenticate admin user and redirect', async () => {
      // Mock successful authentication
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: { email: 'admin@braintrust.com' } },
      })

      // Mock database query for user role
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      // Test the action
      await expect(
        adminLogin({
          email: 'admin@braintrust.com',
          password: 'password123',
        })
      ).rejects.toThrow('NEXT_REDIRECT')

      // Verify authentication was called
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'admin@braintrust.com',
        password: 'password123',
      })

      // Verify role check
      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockSelect).toHaveBeenCalledWith('role')
      expect(mockEq).toHaveBeenCalledWith('email', 'admin@braintrust.com')
      expect(mockSingle).toHaveBeenCalled()

      // Verify revalidation and redirect
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(mockRedirect).toHaveBeenCalledWith('/')
    })

    it('should authenticate SE user and redirect', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: { email: 'se@braintrust.com' } },
      })

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: { role: 'se' },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      await expect(
        adminLogin({
          email: 'se@braintrust.com',
          password: 'password123',
        })
      ).rejects.toThrow('NEXT_REDIRECT')

      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(mockRedirect).toHaveBeenCalledWith('/')
    })
  })

  describe('authentication failures', () => {
    it('should return error for invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
        data: null,
      })

      const result = await adminLogin({
        email: 'wrong@email.com',
        password: 'wrongpassword',
      })

      expect(result).toEqual({
        error: 'Invalid login credentials',
      })

      // Should not proceed to role check or redirect
      expect(mockSupabase.from).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should sign out and return error if user role cannot be verified', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: { email: 'user@braintrust.com' } },
      })

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const result = await adminLogin({
        email: 'user@braintrust.com',
        password: 'password123',
      })

      expect(result).toEqual({
        error: 'Unable to verify user role',
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should sign out and return error for client users', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: { email: 'client@company.com' } },
      })

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: { role: 'client' },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const result = await adminLogin({
        email: 'client@company.com',
        password: 'password123',
      })

      expect(result).toEqual({
        error: 'Access denied. This portal is for administrators only.',
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle undefined user data', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: { email: 'test@braintrust.com' } },
      })

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: undefined,
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const result = await adminLogin({
        email: 'test@braintrust.com',
        password: 'password123',
      })

      expect(result).toEqual({
        error: 'Unable to verify user role',
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle role that is neither admin nor se', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
        data: { user: { email: 'other@braintrust.com' } },
      })

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: { role: 'other' },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const result = await adminLogin({
        email: 'other@braintrust.com',
        password: 'password123',
      })

      expect(result).toEqual({
        error: 'Access denied. This portal is for administrators only.',
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })
})