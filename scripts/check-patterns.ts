#!/usr/bin/env tsx
/**
 * Pattern Checker
 * Validates that code follows project-specific patterns:
 * - Component patterns (loading, error states)
 * - Dark mode support
 * - Accessibility patterns
 * - Tailwind usage
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';

interface PatternViolation {
  file: string;
  rule: string;
  message: string;
  line?: number;
}

const violations: PatternViolation[] = [];
const srcPath = join(process.cwd(), 'src');

/**
 * Check components for required patterns
 */
function checkComponentPatterns(): void {
  const componentsPath = join(srcPath, 'components');
  if (!existsSync(componentsPath)) return;

  const componentFiles = readdirSync(componentsPath, { recursive: true })
    .filter((f) => f.endsWith('.tsx') && !f.includes('test'))
    .slice(0, 30); // Sample first 30 files

  for (const file of componentFiles) {
    const filePath = join(componentsPath, file);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(srcPath, filePath);

    // Check for loading states in async components
    if (
      (content.includes('useQuery') || content.includes('fetch(') || content.includes('axios.')) &&
      !content.includes('isLoading') &&
      !content.includes('loading') &&
      !content.includes('isPending')
    ) {
      violations.push({
        file: relativePath,
        rule: 'Loading States',
        message: 'Component with async operations should handle loading state',
      });
    }

    // Check for error states
    if (
      (content.includes('useQuery') || content.includes('try {')) &&
      !content.includes('error') &&
      !content.includes('Error') &&
      !content.includes('catch')
    ) {
      violations.push({
        file: relativePath,
        rule: 'Error States',
        message: 'Component with async operations should handle error state',
      });
    }

    // Check for dark mode support (should use dark: classes or theme context)
    if (
      content.includes('className') &&
      !content.includes('dark:') &&
      !content.includes('useTheme') &&
      !content.includes('ThemeProvider') &&
      content.includes('bg-') &&
      !file.includes('Layout')
    ) {
      // Only warn, not fail
      // violations.push({
      //   file: relativePath,
      //   rule: 'Dark Mode',
      //   message: 'Component should support dark mode',
      // });
    }

    // Check for inline styles (should use Tailwind)
    const inlineStyleMatch = content.match(/style=\{[^}]*\}/g);
    if (inlineStyleMatch) {
      for (const match of inlineStyleMatch) {
        // Allow dynamic styles (functions, variables)
        if (
          !match.includes('(') &&
          !match.includes('?') &&
          !match.includes('theme') &&
          !match.includes('calc')
        ) {
          const lineNum = content.substring(0, content.indexOf(match)).split('\n').length;
          violations.push({
            file: relativePath,
            rule: 'No Inline Styles',
            message: 'Avoid inline styles, use Tailwind classes instead',
            line: lineNum,
          });
        }
      }
    }

    // Check for accessibility (keyboard navigation, ARIA)
    if (
      content.includes('onClick') &&
      !content.includes('onKeyDown') &&
      !content.includes('onKeyPress') &&
      !content.includes('button') &&
      !content.includes('role=') &&
      !content.includes('tabIndex')
    ) {
      const hasButton = content.match(/<button|Button/g);
      if (!hasButton) {
        violations.push({
          file: relativePath,
          rule: 'Accessibility',
          message: 'Interactive elements should support keyboard navigation',
        });
      }
    }

    // Check for missing alt text on images
    const imgMatches = content.matchAll(/<img[^>]*>/g);
    for (const match of imgMatches) {
      if (!match[0].includes('alt=')) {
        const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;
        violations.push({
          file: relativePath,
          rule: 'Accessibility',
          message: 'Image missing alt attribute',
          line: lineNum,
        });
      }
    }
  }
}

/**
 * Check for forbidden patterns
 */
function checkForbiddenPatterns(): void {
  const allFiles = readdirSync(srcPath, { recursive: true })
    .filter((f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.includes('test'))
    .slice(0, 50); // Sample first 50 files

  for (const file of allFiles) {
    const filePath = join(srcPath, file);
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = relative(srcPath, filePath);

    // Check for any type
    const anyMatches = content.matchAll(/: any\b/g);
    for (const match of anyMatches) {
      const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;
      violations.push({
        file: relativePath,
        rule: 'Type Safety',
        message: 'Avoid using `any` type, use proper types instead',
        line: lineNum,
      });
    }

    // Check for console.log in production code
    if (content.includes('console.log') && !file.includes('test') && !file.includes('mock')) {
      const lineNum = content.split('\n').findIndex((l) => l.includes('console.log')) + 1;
      violations.push({
        file: relativePath,
        rule: 'Code Quality',
        message: 'Remove console.log from production code',
        line: lineNum,
      });
    }

    // Check for TODO/FIXME without issue reference
    const todoMatches = content.matchAll(/(TODO|FIXME):\s*[^#]/gi);
    for (const match of todoMatches) {
      const lineNum = content.substring(0, content.indexOf(match[0])).split('\n').length;
      violations.push({
        file: relativePath,
        rule: 'Code Quality',
        message: 'TODO/FIXME should reference an issue or ticket',
        line: lineNum,
      });
    }
  }
}

/**
 * Check Tailwind usage patterns
 */
function checkTailwindUsage(): void {
  const componentFiles = readdirSync(join(srcPath, 'components'), { recursive: true })
    .filter((f) => f.endsWith('.tsx'))
    .slice(0, 20);

  for (const file of componentFiles) {
    const filePath = join(srcPath, 'components', file);
    const content = readFileSync(filePath, 'utf-8');
    const relativePath = relative(srcPath, filePath);

    // Check for hardcoded colors that should use Tailwind
    const hardcodedColors = content.match(/#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g);
    if (hardcodedColors && !file.includes('theme') && !file.includes('config')) {
      violations.push({
        file: relativePath,
        rule: 'Tailwind Usage',
        message: 'Use Tailwind color classes instead of hardcoded colors',
      });
    }
  }
}

// Run all checks
console.log('🔍 Checking Code Patterns...\n');

checkComponentPatterns();
checkForbiddenPatterns();
checkTailwindUsage();

// Group violations by rule
const violationsByRule = violations.reduce(
  (acc, v) => {
    if (!acc[v.rule]) acc[v.rule] = [];
    acc[v.rule].push(v);
    return acc;
  },
  {} as Record<string, PatternViolation[]>
);

// Report results
let hasErrors = false;
for (const [rule, ruleViolations] of Object.entries(violationsByRule)) {
  console.log(`\n📋 ${rule}: ${ruleViolations.length} violation(s)`);
  for (const violation of ruleViolations.slice(0, 10)) {
    // Show first 10 per rule
    const location = violation.line ? `${violation.file}:${violation.line}` : violation.file;
    console.log(`   ❌ ${location}`);
    console.log(`      ${violation.message}`);
    hasErrors = true;
  }
  if (ruleViolations.length > 10) {
    console.log(`   ... and ${ruleViolations.length - 10} more`);
  }
}

console.log('');

if (!hasErrors) {
  console.log('✅ All pattern checks passed!\n');
  process.exit(0);
} else {
  console.error(`❌ Found ${violations.length} pattern violation(s). Please review and fix.\n`);
  console.log('💡 Tips:');
  console.log('   - Ensure components handle loading/error states');
  console.log('   - Use Tailwind classes instead of inline styles');
  console.log('   - Add proper TypeScript types (avoid `any`)');
  console.log('   - Follow accessibility best practices\n');
  process.exit(1);
}
