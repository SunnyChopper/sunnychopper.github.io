#!/usr/bin/env tsx
/**
 * Architecture Validator
 * Validates that code follows architectural patterns:
 * - Atomic design structure
 * - Service layer patterns
 * - Import/export conventions
 * - File organization
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

interface ValidationResult {
  rule: string;
  passed: boolean;
  message: string;
  files?: string[];
}

const results: ValidationResult[] = [];
const srcPath = join(process.cwd(), 'src');

/**
 * Check atomic design structure
 */
function validateAtomicDesign(): ValidationResult {
  const componentsPath = join(srcPath, 'components');
  const violations: string[] = [];

  if (!existsSync(componentsPath)) {
    return {
      rule: 'Atomic Design Structure',
      passed: false,
      message: 'components directory not found',
    };
  }

  const allowedDirs = ['atoms', 'molecules', 'organisms', 'templates', 'pages'];
  const dirs = readdirSync(componentsPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of dirs) {
    if (!allowedDirs.includes(dir) && !dir.startsWith('_')) {
      violations.push(`Unexpected directory: components/${dir}`);
    }
  }

  // Check that components are in correct directories
  const checkComponentLocation = (dir: string, allowedTypes: string[]) => {
    const dirPath = join(componentsPath, dir);
    if (!existsSync(dirPath)) return;

    const files = readdirSync(dirPath, { withFileTypes: true }).filter(
      (f) => f.isFile() && f.name.endsWith('.tsx')
    );

    for (const file of files) {
      const filePath = join(dirPath, file.name);
      const content = readFileSync(filePath, 'utf-8') as string;

      // Check for imports from wrong atomic level
      for (const type of allowedTypes) {
        if (type === dir) continue;
        const pattern = new RegExp(`from ['"].*components/${type}/`, 'g');
        if (pattern.test(content)) {
          violations.push(`${file.name} in ${dir}/ imports from ${type}/ (violates atomic design)`);
        }
      }
    }
  };

  checkComponentLocation('atoms', ['atoms']);
  checkComponentLocation('molecules', ['atoms', 'molecules']);
  checkComponentLocation('organisms', ['atoms', 'molecules', 'organisms']);

  return {
    rule: 'Atomic Design Structure',
    passed: violations.length === 0,
    message:
      violations.length > 0
        ? `Found ${violations.length} violations`
        : 'All components follow atomic design',
    files: violations,
  };
}

/**
 * Check service layer patterns
 */
function validateServiceLayer(): ValidationResult {
  const servicesPath = join(srcPath, 'services');
  const violations: string[] = [];

  if (!existsSync(servicesPath)) {
    return {
      rule: 'Service Layer Patterns',
      passed: true,
      message: 'No services directory (optional)',
    };
  }

  const serviceFiles = readdirSync(servicesPath, { recursive: true })
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    .map((f) => join(servicesPath, f));

  for (const filePath of serviceFiles) {
    const content = readFileSync(filePath, 'utf-8') as string;
    const relativePath = relative(srcPath, filePath);

    // Check for ApiResponse return type
    const hasApiResponse = /Promise<ApiResponse</.test(content);
    if (!hasApiResponse && content.includes('export') && content.includes('async')) {
      violations.push(`${relativePath}: Missing ApiResponse return type`);
    }

    // Check for direct DOM manipulation
    if (/document\.|window\./.test(content)) {
      violations.push(`${relativePath}: Service should not manipulate DOM`);
    }

    // Check for React imports (services should be framework-agnostic)
    if (/from ['"]react['"]/.test(content)) {
      violations.push(`${relativePath}: Service should not import React`);
    }
  }

  return {
    rule: 'Service Layer Patterns',
    passed: violations.length === 0,
    message:
      violations.length > 0
        ? `Found ${violations.length} violations`
        : 'All services follow patterns',
    files: violations,
  };
}

/**
 * Check import organization
 */
function validateImports(): ValidationResult {
  const violations: string[] = [];
  const componentFiles = readdirSync(join(srcPath, 'components'), {
    recursive: true,
  })
    .filter((f) => f.endsWith('.tsx'))
    .slice(0, 20); // Sample first 20 files

  for (const file of componentFiles) {
    const filePath = join(srcPath, 'components', file);
    const content = readFileSync(filePath, 'utf-8') as string;
    const lines = content.split('\n');

    let lastImportLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('import ')) {
        lastImportLine = i;
      }
    }

    // Check for imports after code
    if (lastImportLine > 0) {
      const afterImports = lines.slice(lastImportLine + 1, lastImportLine + 5);
      if (afterImports.some((l) => l.trim().startsWith('import '))) {
        violations.push(`${file}: Imports not grouped at top`);
      }
    }
  }

  return {
    rule: 'Import Organization',
    passed: violations.length === 0,
    message:
      violations.length > 0
        ? `Found ${violations.length} violations in sample`
        : 'Imports are well-organized',
    files: violations.slice(0, 5), // Show first 5
  };
}

/**
 * Check file naming conventions
 */
function validateFileNaming(): ValidationResult {
  const violations: string[] = [];

  const checkDirectory = (dir: string, pattern: RegExp, type: string) => {
    const dirPath = join(srcPath, dir);
    if (!existsSync(dirPath)) return;

    const files = readdirSync(dirPath, { recursive: true }).filter(
      (f) => f.endsWith('.tsx') || f.endsWith('.ts')
    );

    for (const file of files) {
      const fileName = file.split('/').pop() || '';
      if (!pattern.test(fileName)) {
        violations.push(`${dir}/${file}: Should follow ${type} naming`);
      }
    }
  };

  // Components should be PascalCase
  checkDirectory('components', /^[A-Z][a-zA-Z0-9]*\.tsx$/, 'PascalCase');

  // Services should be kebab-case
  checkDirectory('services', /^[a-z][a-z0-9-]*\.ts$/, 'kebab-case');

  // Utils should be kebab-case
  checkDirectory('utils', /^[a-z][a-z0-9-]*\.ts$/, 'kebab-case');

  return {
    rule: 'File Naming Conventions',
    passed: violations.length === 0,
    message:
      violations.length > 0
        ? `Found ${violations.length} violations`
        : 'All files follow naming conventions',
    files: violations.slice(0, 10),
  };
}

// Run all validations
console.log('🏗️  Validating Architecture...\n');

results.push(validateAtomicDesign());
results.push(validateServiceLayer());
results.push(validateImports());
results.push(validateFileNaming());

// Report results
let allPassed = true;
for (const result of results) {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.rule}: ${result.message}`);
  if (result.files && result.files.length > 0) {
    result.files.forEach((file) => console.log(`   - ${file}`));
  }
  if (!result.passed) allPassed = false;
}

console.log('');

if (allPassed) {
  console.log('✅ All architecture validations passed!\n');
  process.exit(0);
} else {
  console.error('❌ Architecture validation failed. Please fix the issues above.\n');
  process.exit(1);
}
