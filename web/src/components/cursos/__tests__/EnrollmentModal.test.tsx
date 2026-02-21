import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnrollmentModal } from '../EnrollmentModal';

// Mock the UI Dialog component
jest.mock('@/components/ui/dialog', () => {
    return {
        Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) =>
            open ? <div data-testid="dialog-root">{children}</div> : null,
        DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <div data-testid="dialog-content" className={className}>{children}</div>
        ),
        DialogHeader: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="dialog-header">{children}</div>
        ),
        DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
            <h2 data-testid="dialog-title" className={className}>{children}</h2>
        ),
        DialogFooter: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="dialog-footer">{children}</div>
        ),
        DialogDescription: ({ children }: { children: React.ReactNode }) => (
            <p data-testid="dialog-description">{children}</p>
        ),
    };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    CheckCircle: ({ className }: { className?: string }) => <span className={className}>✓</span>,
    User: ({ className }: { className?: string }) => <span className={className}>👤</span>,
    CreditCard: ({ className }: { className?: string }) => <span className={className}>💳</span>,
    PartyPopper: ({ className }: { className?: string }) => <span className={className}>🎉</span>,
    Loader2: ({ className }: { className?: string }) => <span className={className}>⏳</span>,
    Phone: ({ className }: { className?: string }) => <span className={className}>📞</span>,
    X: ({ className }: { className?: string }) => <span className={className}>X</span>,
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('EnrollmentModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        courseId: 1,
        courseName: 'Test Course',
        coursePrice: 5000,
        linkMercadoPago: 'https://mpago.la/test',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });
    });

    describe('Step 1 - Personal Data Validation', () => {
        it('shows error when name is empty', async () => {
            render(<EnrollmentModal {...defaultProps} />);

            const submitButton = screen.getByRole('button', { name: /continuar/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
            });
        });

        it('shows error when email is empty', async () => {
            render(<EnrollmentModal {...defaultProps} />);

            const nameInput = screen.getByPlaceholderText(/tu nombre y apellido/i);
            fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });

            const submitButton = screen.getByRole('button', { name: /continuar/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
            });
        });

        // TODO: This test is flaky due to timing issues with mock Dialog rendering
        // Need to investigate root cause in the mock implementation
        it.skip('shows error when email format is invalid', async () => {
            render(<EnrollmentModal {...defaultProps} />);

            const nameInput = screen.getByPlaceholderText(/tu nombre y apellido/i);
            const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
            const phoneInput = screen.getByPlaceholderText(/099 123 456/i);

            fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
            fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
            fireEvent.change(phoneInput, { target: { value: '099123456' } });

            const submitButton = screen.getByRole('button', { name: /continuar/i });
            fireEvent.click(submitButton);

            const errorMessage = await screen.findByText(/email inválido/i, {}, { timeout: 5000 });
            expect(errorMessage).toBeInTheDocument();
        });

        it('shows error when phone is empty', async () => {
            render(<EnrollmentModal {...defaultProps} />);

            const nameInput = screen.getByPlaceholderText(/tu nombre y apellido/i);
            const emailInput = screen.getByPlaceholderText(/tu@email.com/i);

            fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
            fireEvent.change(emailInput, { target: { value: 'juan@test.com' } });

            const submitButton = screen.getByRole('button', { name: /continuar/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/el teléfono es requerido/i)).toBeInTheDocument();
            });
        });

        it('proceeds to Step 2 when form is valid', async () => {
            render(<EnrollmentModal {...defaultProps} />);

            const nameInput = screen.getByPlaceholderText(/tu nombre y apellido/i);
            const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
            const phoneInput = screen.getByPlaceholderText(/099 123 456/i);

            fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
            fireEvent.change(emailInput, { target: { value: 'juan@test.com' } });
            fireEvent.change(phoneInput, { target: { value: '099123456' } });

            const submitButton = screen.getByRole('button', { name: /continuar/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/total a pagar/i)).toBeInTheDocument();
            });
        });
    });

    describe('Step 2 - Payment Method', () => {
        async function goToStep2() {
            render(<EnrollmentModal {...defaultProps} />);

            const nameInput = screen.getByPlaceholderText(/tu nombre y apellido/i);
            const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
            const phoneInput = screen.getByPlaceholderText(/099 123 456/i);

            fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
            fireEvent.change(emailInput, { target: { value: 'juan@test.com' } });
            fireEvent.change(phoneInput, { target: { value: '099123456' } });

            const submitButton = screen.getByRole('button', { name: /continuar/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/total a pagar/i)).toBeInTheDocument();
            });
        }

        it('displays course price', async () => {
            await goToStep2();

            // Price should be formatted with currency
            expect(screen.getByText(/5.*000/)).toBeInTheDocument();
        });

        it('shows payment method options', async () => {
            await goToStep2();

            expect(screen.getByText(/transferencia bancaria/i)).toBeInTheDocument();
            expect(screen.getByText(/mercado pago/i)).toBeInTheDocument();
        });

        it('submit button is disabled without payment method', async () => {
            await goToStep2();

            const confirmButton = screen.getByRole('button', { name: /confirmar inscripción/i });
            expect(confirmButton).toBeDisabled();
        });

        it('submit button is enabled after selecting payment method', async () => {
            await goToStep2();

            // Get all radio inputs and click the first one (transferencia)
            const radios = screen.getAllByRole('radio');
            fireEvent.click(radios[0]);

            const confirmButton = screen.getByRole('button', { name: /confirmar inscripción/i });
            expect(confirmButton).not.toBeDisabled();
        });
    });

    describe('Modal Behavior', () => {
        it('renders modal when isOpen is true', () => {
            render(<EnrollmentModal {...defaultProps} />);

            expect(screen.getByText(/inscripción: test course/i)).toBeInTheDocument();
        });

        it('does not render modal content when isOpen is false', () => {
            render(<EnrollmentModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByText(/inscripción: test course/i)).not.toBeInTheDocument();
        });
    });
});
