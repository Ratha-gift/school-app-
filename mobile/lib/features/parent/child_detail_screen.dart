import 'package:flutter/material.dart';

import '../../core/theme.dart';
import 'child_attendance_tab.dart';
import 'child_grades_tab.dart';
import 'parent_models.dart';

/// A child's attendance and grades, in two tabs.
class ChildDetailScreen extends StatelessWidget {
  final Child child;

  const ChildDetailScreen({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    // DefaultTabController connects the TabBar and the TabBarView.
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(child.name),
          bottom: const TabBar(
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            indicatorColor: AppColors.primary,
            tabs: [
              Tab(text: 'វត្តមាន'),
              Tab(text: 'ពិន្ទុ'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            ChildAttendanceTab(childId: child.id),
            ChildGradesTab(childId: child.id),
          ],
        ),
      ),
    );
  }
}
