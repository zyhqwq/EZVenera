import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:ezvenera/src/navigation/app_destination.dart';
import 'package:ezvenera/src/settings/settings_controller.dart';
import 'package:ezvenera/src/shell/main_shell.dart';

void main() {
  test('default source indexes include both repositories', () {
    expect(SettingsController.defaultSourceIndexUrls, <String>[
      'https://raw.githubusercontent.com/WEP-56/EZvenera-config/main/index.json',
      'https://cdn.jsdelivr.net/gh/venera-app/venera-configs@main/index.json',
    ]);
  });

  testWidgets('app shell renders main destinations', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: MainShell()));

    expect(AppDestination.values, <AppDestination>[
      AppDestination.search,
      AppDestination.category,
      AppDestination.local,
      AppDestination.settings,
    ]);
    expect(find.text('Search'), findsWidgets);
    expect(find.text('Category'), findsWidgets);
    expect(find.text('Local'), findsWidgets);
    expect(find.text('Settings'), findsWidgets);
  });
}
