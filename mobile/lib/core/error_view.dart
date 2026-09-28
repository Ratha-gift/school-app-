import 'package:flutter/material.dart';

import 'theme.dart';

/// Shows an error message with a "try again" button.
class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const ErrorView({super.key, required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 48, color: AppColors.error),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.error),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('ព្យាយាមម្ដងទៀត'),
          ),
        ],
      ),
    );
  }
}
