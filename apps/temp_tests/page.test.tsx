import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminLoginPage from '../page'
import { adminLogin } from '../actions'

// Mock the Server Action
jest.mock('../actions')
const mockAdminLogin = adminLogin as jest.MockedFunction<typeof adminLogin>

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle" />,
  Loader2: () => <div data-testid="loader2" />,
  Lock: () => <div data-testid="lock" />,
  Mail: () => <div data-testid="mail" />,
}))

// Mock @nexus/ui Button component
jest.mock('@nexus/ui', () => ({
  Button: ({ children, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

describe('AdminLoginPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the admin login form', () => {
    render(<AdminLoginPage />)

    expect(screen.getByText('Admin Portal')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the admin dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('displays test credentials section', () => {
    render(<AdminLoginPage />)

    expect(screen.getByText('Test Credentials:')).toBeInTheDocument()
    expect(screen.getByText('Admin: admin@braintrust.com')).toBeInTheDocument()
    expect(screen.getByText('SE: se@braintrust.com')).toBeInTheDocument()
  })

  it('shows forgot password link', () => {
    render(<AdminLoginPage />)

    const forgotPasswordLink = screen.getByText('Forgot your password?')
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/auth/forgot-password')
  })

  it('has proper form validation attributes', () => {
    render(<AdminLoginPage />)

    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('placeholder', 'admin@braintrust.com')

    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('placeholder', '••••••••')
  })

  describe('form submission', () => {
    it('submits form with valid credentials', async () => {
      mockAdminLogin.mockResolvedValue({ error: '' }) // Success case

      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'admin@braintrust.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAdminLogin).toHaveBeenCalledWith({
          email: 'admin@braintrust.com',
          password: 'password123',
        })
      })
    })

    it('shows loading state during form submission', async () => {
      // Mock a delayed response to test loading state
      mockAdminLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'admin@braintrust.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Check loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
      expect(screen.getByTestId('loader2')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument()
      })
    })

    it('displays error message when login fails', async () => {
      const errorMessage = 'Invalid login credentials'
      mockAdminLogin.mockResolvedValue({ error: errorMessage })

      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'wrong@email.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
        expect(screen.getByTestId('alert-circle')).toBeInTheDocument()
      })

      // Button should be re-enabled after error
      expect(submitButton).not.toBeDisabled()
    })

    it('clears error message on new submission attempt', async () => {
      // First submission with error
      mockAdminLogin.mockResolvedValueOnce({ error: 'Invalid credentials' })

      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'wrong@email.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Second submission should clear error
      mockAdminLogin.mockResolvedValueOnce({ error: '' })

      await user.clear(emailInput)
      await user.clear(passwordInput)
      await user.type(emailInput, 'admin@braintrust.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Error should be cleared immediately on form submission
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })
  })

  describe('redirect error handling', () => {
    it('handles Next.js redirect errors gracefully', async () => {
      // Mock redirect error (successful login)
      const redirectError = new Error('NEXT_REDIRECT')
      Object.defineProperty(redirectError, 'digest', {
        value: 'NEXT_REDIRECT;/dashboard',
        writable: false,
      })

      mockAdminLogin.mockRejectedValue(redirectError)

      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'admin@braintrust.com')
      await user.type(passwordInput, 'password123')

      // Should not show error message for redirect
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('An unexpected error occurred')).not.toBeInTheDocument()
      })
    })

    it('shows error message for non-redirect exceptions', async () => {
      const networkError = new Error('Network error')
      mockAdminLogin.mockRejectedValue(networkError)

      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'admin@braintrust.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
      })

      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('has proper form labels and accessibility attributes', () => {
      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')

      expect(emailInput).toHaveAccessibleName('Email Address')
      expect(passwordInput).toHaveAccessibleName('Password')
    })

    it('associates error messages with form elements', async () => {
      mockAdminLogin.mockResolvedValue({ error: 'Invalid credentials' })

      render(<AdminLoginPage />)

      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })

      await user.type(emailInput, 'wrong@email.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        const errorElement = screen.getByText('Invalid credentials')
        expect(errorElement).toBeInTheDocument()
        expect(errorElement).toHaveClass('text-red-600')
      })
    })
  })
})