# Styled-Components Patterns

## Token Object Structure

```tsx
// tokens.ts (shared) or top of component file
export const tokens = {
  colors: {
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textMuted: '#6B7280',
    error: '#EF4444',
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    sizes: { sm: '12px', base: '14px', lg: '16px', xl: '20px', '2xl': '24px' },
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px' },
  radii: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },
};
```

## Basic Component

```tsx
import styled from 'styled-components';
import { tokens } from './tokens';

interface CardProps {
  elevated?: boolean;
}

const Card = styled.div<CardProps>`
  background: ${tokens.colors.background};
  border: 1px solid ${tokens.colors.border};
  border-radius: ${tokens.radii.lg};
  padding: ${tokens.spacing.lg};
  box-shadow: ${({ elevated }) => elevated ? tokens.shadows.md : tokens.shadows.sm};
`;
```

## Variant Props Pattern

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    background: ${tokens.colors.primary};
    color: white;
    &:hover { background: ${tokens.colors.primaryHover}; }
  `,
  secondary: `
    background: transparent;
    color: ${tokens.colors.primary};
    border: 1px solid ${tokens.colors.primary};
  `,
  ghost: `
    background: transparent;
    color: ${tokens.colors.text};
    &:hover { background: ${tokens.colors.surface}; }
  `,
};

const Button = styled.button<{ variant?: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  gap: ${tokens.spacing.sm};
  padding: ${tokens.spacing.sm} ${tokens.spacing.md};
  border-radius: ${tokens.radii.md};
  font-size: ${tokens.typography.sizes.base};
  font-weight: ${tokens.typography.weights.medium};
  font-family: ${tokens.typography.fontFamily};
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  ${({ variant = 'primary' }) => variantStyles[variant]}
`;
```

## Responsive Breakpoints

```tsx
const breakpoints = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' };

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${tokens.spacing.md};

  @media (min-width: ${breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
```

## Interactive States

```tsx
const Input = styled.input`
  width: 100%;
  padding: ${tokens.spacing.sm} ${tokens.spacing.md};
  border: 1px solid ${tokens.colors.border};
  border-radius: ${tokens.radii.md};
  font-size: ${tokens.typography.sizes.base};
  color: ${tokens.colors.text};
  background: ${tokens.colors.background};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;

  &::placeholder { color: ${tokens.colors.textMuted}; }
  &:hover { border-color: ${tokens.colors.primary}; }
  &:focus {
    border-color: ${tokens.colors.primary};
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &[aria-invalid="true"] { border-color: ${tokens.colors.error}; }
`;
```

## Dark Mode via CSS Custom Properties

```tsx
// Use CSS variables for themes instead of JS tokens
const GlobalStyle = createGlobalStyle`
  :root {
    --color-bg: #FFFFFF;
    --color-text: #111827;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --color-bg: #111827;
      --color-text: #F9FAFB;
    }
  }
`;

const ThemedCard = styled.div`
  background: var(--color-bg);
  color: var(--color-text);
`;
```

## Typography Components

```tsx
const Heading = styled.h2`
  font-family: ${tokens.typography.fontFamily};
  font-size: ${tokens.typography.sizes['2xl']};
  font-weight: ${tokens.typography.weights.bold};
  line-height: ${tokens.typography.lineHeights.tight};
  color: ${tokens.colors.text};
  margin: 0;
`;

const Body = styled.p`
  font-family: ${tokens.typography.fontFamily};
  font-size: ${tokens.typography.sizes.base};
  line-height: ${tokens.typography.lineHeights.relaxed};
  color: ${tokens.colors.textMuted};
  margin: 0;
`;
```
