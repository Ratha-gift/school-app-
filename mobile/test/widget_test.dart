// Simple smoke test: the login screen builds and shows its main widgets.
//
// We pump LoginScreen directly (not SchoolApp) because SchoolApp would
// call the API / secure storage and download Google Fonts, which don't
// work inside widget tests.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/features/auth/login_screen.dart';

void main() {
  testWidgets('Login screen builds', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));

    expect(find.text('School App'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.byType(FilledButton), findsOneWidget);
  });
}
