import { test, expect } from '@playwright/test';

test.describe('Enrollment Flow', () => {
    test('complete enrollment flow with bank transfer', async ({ page }) => {
        // Navigate to course catalog
        await page.goto('/cursos');

        // Wait for courses to load
        await page.waitForSelector('[data-testid="course-card"], .card, article', {
            timeout: 10000,
        }).catch(() => {
            // If no specific selector, wait for any course link
        });

        // Click on first course link (any link that goes to /cursos/)
        const courseLinks = page.locator('a[href^="/cursos/"]').first();
        if ((await courseLinks.count()) > 0) {
            await courseLinks.click();
        } else {
            // Skip test if no courses available
            test.skip();
            return;
        }

        // Wait for course detail page
        await page.waitForLoadState('networkidle');

        // Click enroll button
        const enrollButton = page.getByRole('button', { name: /inscribirme/i });
        if ((await enrollButton.count()) > 0) {
            await enrollButton.click();
        } else {
            test.skip();
            return;
        }

        // Wait for modal to open
        await expect(page.getByText(/inscripción:/i)).toBeVisible({ timeout: 5000 });

        // Step 1: Fill personal data
        await page.getByPlaceholder(/tu nombre y apellido/i).fill('Test User');
        await page.getByPlaceholder(/tu@email.com/i).fill('test@example.com');
        await page.getByPlaceholder(/099 123 456/i).fill('099999999');

        // Click continue
        await page.getByRole('button', { name: /continuar/i }).click();

        // Step 2: Wait for payment options
        await expect(page.getByText(/total a pagar/i)).toBeVisible({ timeout: 5000 });

        // Select bank transfer
        await page.getByText(/transferencia bancaria/i).click();

        // Click confirm
        await page.getByRole('button', { name: /confirmar inscripción/i }).click();

        // Step 3: Verify confirmation
        await expect(page.getByText(/inscripción recibida/i)).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/test user/i)).toBeVisible();
    });

    test('form validation prevents empty submission', async ({ page }) => {
        // Navigate directly to a course if possible
        await page.goto('/cursos');
        await page.waitForLoadState('networkidle');

        // Click on first course
        const courseLink = page.locator('a[href^="/cursos/"]').first();
        if ((await courseLink.count()) === 0) {
            test.skip();
            return;
        }
        await courseLink.click();

        // Click enroll button
        const enrollButton = page.getByRole('button', { name: /inscribirme/i });
        if ((await enrollButton.count()) === 0) {
            test.skip();
            return;
        }
        await enrollButton.click();

        // Wait for modal
        await expect(page.getByText(/inscripción:/i)).toBeVisible({ timeout: 5000 });

        // Try to submit empty form
        await page.getByRole('button', { name: /continuar/i }).click();

        // Should show validation errors
        await expect(page.getByText(/el nombre es requerido/i)).toBeVisible();
    });

    test('Mercado Pago payment option displays correctly', async ({ page }) => {
        // Navigate to course catalog
        await page.goto('/cursos');
        await page.waitForLoadState('networkidle');

        // Click on first available course
        const courseLink = page.locator('a[href^="/cursos/"]').first();
        if ((await courseLink.count()) === 0) {
            test.skip();
            return;
        }
        await courseLink.click();
        await page.waitForLoadState('networkidle');

        // Click enroll button
        const enrollButton = page.getByRole('button', { name: /inscribirme/i });
        if ((await enrollButton.count()) === 0) {
            test.skip();
            return;
        }
        await enrollButton.click();

        // Wait for modal
        await expect(page.getByText(/inscripción:/i)).toBeVisible({ timeout: 5000 });

        // Fill Step 1
        await page.getByPlaceholder(/tu nombre y apellido/i).fill('Test MP User');
        await page.getByPlaceholder(/tu@email.com/i).fill('testmp@example.com');
        await page.getByPlaceholder(/099 123 456/i).fill('099888777');

        // Continue to Step 2
        await page.getByRole('button', { name: /continuar/i }).click();
        await expect(page.getByText(/total a pagar/i)).toBeVisible({ timeout: 5000 });

        // Verify Mercado Pago option is available
        const mpOption = page.getByText(/mercado pago/i);
        await expect(mpOption).toBeVisible();

        // Select Mercado Pago
        await mpOption.click();

        // Confirm enrollment
        await page.getByRole('button', { name: /confirmar inscripción/i }).click();

        // Verify Step 3 shows confirmation
        await expect(page.getByText(/inscripción recibida/i)).toBeVisible({ timeout: 10000 });
    });

    test('back button navigates between steps', async ({ page }) => {
        // Navigate to course catalog
        await page.goto('/cursos');
        await page.waitForLoadState('networkidle');

        // Click on first available course
        const courseLink = page.locator('a[href^="/cursos/"]').first();
        if ((await courseLink.count()) === 0) {
            test.skip();
            return;
        }
        await courseLink.click();
        await page.waitForLoadState('networkidle');

        // Click enroll button
        const enrollButton = page.getByRole('button', { name: /inscribirme/i });
        if ((await enrollButton.count()) === 0) {
            test.skip();
            return;
        }
        await enrollButton.click();

        // Wait for modal
        await expect(page.getByText(/inscripción:/i)).toBeVisible({ timeout: 5000 });

        // Fill Step 1 with test data
        const testName = 'Navigation Test User';
        const testEmail = 'navtest@example.com';
        const testPhone = '099111222';

        await page.getByPlaceholder(/tu nombre y apellido/i).fill(testName);
        await page.getByPlaceholder(/tu@email.com/i).fill(testEmail);
        await page.getByPlaceholder(/099 123 456/i).fill(testPhone);

        // Continue to Step 2
        await page.getByRole('button', { name: /continuar/i }).click();
        await expect(page.getByText(/total a pagar/i)).toBeVisible({ timeout: 5000 });

        // Click back button
        const backButton = page.getByRole('button', { name: /volver/i });
        await expect(backButton).toBeVisible();
        await backButton.click();

        // Verify we're back on Step 1 and data is preserved
        await expect(page.getByPlaceholder(/tu nombre y apellido/i)).toHaveValue(testName);
        await expect(page.getByPlaceholder(/tu@email.com/i)).toHaveValue(testEmail);
        await expect(page.getByPlaceholder(/099 123 456/i)).toHaveValue(testPhone);
    });

    test('course detail page shows correct info before enrollment', async ({ page }) => {
        // Navigate to course catalog
        await page.goto('/cursos');
        await page.waitForLoadState('networkidle');

        // Get first course card and its title
        const courseLink = page.locator('a[href^="/cursos/"]').first();
        if ((await courseLink.count()) === 0) {
            test.skip();
            return;
        }

        // Click to go to course detail
        await courseLink.click();
        await page.waitForLoadState('networkidle');

        // Verify course detail page elements
        const pageTitle = page.locator('h1').first();
        await expect(pageTitle).toBeVisible({ timeout: 5000 });

        // Verify CTA button exists
        const enrollButton = page.getByRole('button', { name: /inscribirme/i });
        if ((await enrollButton.count()) === 0) {
            // Some courses might not have enroll button, skip
            test.skip();
            return;
        }
        await expect(enrollButton).toBeVisible();

        // Click enroll and verify modal opens
        await enrollButton.click();
        await expect(page.getByText(/inscripción:/i)).toBeVisible({ timeout: 5000 });

        // Verify modal has step indicators (Step 1)
        await expect(page.getByText(/datos personales/i)).toBeVisible();
    });

    test('discount code input is available in Step 2', async ({ page }) => {
        // Navigate to course catalog
        await page.goto('/cursos');
        await page.waitForLoadState('networkidle');

        // Click on first available course
        const courseLink = page.locator('a[href^="/cursos/"]').first();
        if ((await courseLink.count()) === 0) {
            test.skip();
            return;
        }
        await courseLink.click();
        await page.waitForLoadState('networkidle');

        // Click enroll button
        const enrollButton = page.getByRole('button', { name: /inscribirme/i });
        if ((await enrollButton.count()) === 0) {
            test.skip();
            return;
        }
        await enrollButton.click();

        // Wait for modal
        await expect(page.getByText(/inscripción:/i)).toBeVisible({ timeout: 5000 });

        // Fill Step 1
        await page.getByPlaceholder(/tu nombre y apellido/i).fill('Discount Test User');
        await page.getByPlaceholder(/tu@email.com/i).fill('discount@example.com');
        await page.getByPlaceholder(/099 123 456/i).fill('099555666');

        // Continue to Step 2
        await page.getByRole('button', { name: /continuar/i }).click();
        await expect(page.getByText(/total a pagar/i)).toBeVisible({ timeout: 5000 });

        // Verify discount code section is visible
        const discountLabel = page.getByText(/código de descuento/i);
        await expect(discountLabel).toBeVisible();

        // Verify discount input exists
        const discountInput = page.getByPlaceholder(/ingresa tu código/i);
        await expect(discountInput).toBeVisible();

        // Test entering a code (doesn't need to be valid, just verify input works)
        await discountInput.fill('TESTCODE');
        await expect(discountInput).toHaveValue('TESTCODE');
    });
});
