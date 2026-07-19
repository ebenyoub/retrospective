import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

describe('Card Component Suite', () => {
  it('renders Card with children and class name', () => {
    render(<Card className="custom-card-class">Hello Card</Card>);
    const element = screen.getByText('Hello Card');
    expect(element).toBeTruthy();
    expect(element.className).toContain('custom-card-class');
    expect(element.className).toContain('rounded-xl');
  });

  it('renders all sub-components properly', () => {
    render(
      <Card>
        <CardHeader className="header-class">
          <CardTitle className="title-class">My Title</CardTitle>
          <CardDescription className="desc-class">My Description</CardDescription>
        </CardHeader>
        <CardContent className="content-class">
          My Content
        </CardContent>
        <CardFooter className="footer-class">
          My Footer
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('My Title')).toBeTruthy();
    expect(screen.getByText('My Description')).toBeTruthy();
    expect(screen.getByText('My Content')).toBeTruthy();
    expect(screen.getByText('My Footer')).toBeTruthy();
  });
});
