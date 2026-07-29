import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Form, { FormField, FormLabel, FormInput, FormGroup } from '../Form';

describe('Form Component Suite', () => {
  it('renders Form with children and classes', () => {
    render(<Form className="custom-form-class">My Form</Form>);
    const element = screen.getByText('My Form');
    expect(element).toBeTruthy();
    expect(element.className).toContain('custom-form-class');
    expect(element.className).toContain('bg-navy-mid');
  });

  it('renders FormField and FormLabel and FormInput properly', () => {
    render(
      <Form>
        <FormGroup>
          <FormField className="field-class">
            <FormLabel htmlFor="name" className="label-class">Nom</FormLabel>
            <FormInput id="name" placeholder="Ex : John" />
          </FormField>
        </FormGroup>
      </Form>
    );

    expect(screen.getByText('Nom')).toBeTruthy();
    expect(screen.getByPlaceholderText('Ex : John')).toBeTruthy();
  });
});
