import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// All app colors in one place.
class AppColors {
  static const primary = Color(0xFF0F9F8F); // teal
  static const background = Color(0xFFF8FAFC); // slate-50
  static const navy = Color(0xFF020617); // slate-950
  static const error = Color(0xFFDC2626); // red-600
}

/// Builds the app-wide Material 3 theme.
ThemeData buildAppTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      error: AppColors.error,
    ),
    scaffoldBackgroundColor: AppColors.background,
  );

  // Border shared by all text field states; only the color changes.
  OutlineInputBorder border(Color color, [double width = 1]) =>
      OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: color, width: width),
      );

  return base.copyWith(
    // Kantumruy Pro supports both Khmer and Latin characters.
    textTheme: GoogleFonts.kantumruyProTextTheme(base.textTheme),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.navy,
      foregroundColor: Colors.white, // title + icon color
      titleTextStyle: GoogleFonts.kantumruyPro(
        color: Colors.white,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: border(Colors.grey.shade300),
      enabledBorder: border(Colors.grey.shade300),
      focusedBorder: border(AppColors.primary, 2),
      errorBorder: border(AppColors.error),
      focusedErrorBorder: border(AppColors.error, 2),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(48), // full width, 48px tall
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    ),
  );
}
