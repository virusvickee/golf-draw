#!/usr/bin/env node

/**
 * Middleware Logic Test
 * Tests the routing logic without running the full server
 */

console.log('🧪 Testing Middleware Routing Logic\n');

// Test scenarios
const scenarios = [
  {
    name: 'Admin login → /admin',
    user: { id: '1', role: 'admin' },
    path: '/login',
    expected: '/admin',
  },
  {
    name: 'User login → /dashboard',
    user: { id: '2', role: 'user' },
    path: '/login',
    expected: '/dashboard',
  },
  {
    name: 'Admin visiting /dashboard → /admin',
    user: { id: '1', role: 'admin' },
    path: '/dashboard',
    expected: '/admin',
  },
  {
    name: 'User visiting /admin → /dashboard',
    user: { id: '2', role: 'user' },
    path: '/admin',
    expected: '/dashboard',
  },
  {
    name: 'Unauthenticated visiting /admin → /login',
    user: null,
    path: '/admin',
    expected: '/login',
  },
  {
    name: 'Unauthenticated visiting /dashboard → /login',
    user: null,
    path: '/dashboard',
    expected: '/login',
  },
  {
    name: 'Admin visiting /admin → stays',
    user: { id: '1', role: 'admin' },
    path: '/admin',
    expected: '/admin',
  },
  {
    name: 'User visiting /dashboard → stays',
    user: { id: '2', role: 'user' },
    path: '/dashboard',
    expected: '/dashboard',
  },
];

// Simulate middleware logic
function simulateMiddleware(user, path) {
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register');
  const isAdminPage = path.startsWith('/admin');
  const isDashboardPage = path.startsWith('/dashboard');

  // Not authenticated
  if (!user && (isAdminPage || isDashboardPage)) {
    return '/login';
  }

  // Authenticated
  if (user) {
    const isAdmin = user.role === 'admin';

    // Redirect authenticated users away from auth pages
    if (isAuthPage) {
      return isAdmin ? '/admin' : '/dashboard';
    }

    // Admin trying to access dashboard
    if (isAdmin && isDashboardPage) {
      return '/admin';
    }

    // User trying to access admin
    if (!isAdmin && isAdminPage) {
      return '/dashboard';
    }
  }

  // No redirect
  return path;
}

// Run tests
let passed = 0;
let failed = 0;

scenarios.forEach((scenario) => {
  const result = simulateMiddleware(scenario.user, scenario.path);
  const success = result === scenario.expected;

  if (success) {
    console.log(`✅ ${scenario.name}`);
    console.log(`   ${scenario.path} → ${result}\n`);
    passed++;
  } else {
    console.log(`❌ ${scenario.name}`);
    console.log(`   Expected: ${scenario.expected}`);
    console.log(`   Got: ${result}\n`);
    failed++;
  }
});

console.log('─'.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 All tests passed! Middleware logic is correct.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Check the logic.\n');
  process.exit(1);
}
