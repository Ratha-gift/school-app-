<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// មេសម្រាប់ admin controllers: ជំនួយ pagination និង search
abstract class AdminController extends Controller
{
    // ?per_page= (1..100, default 15) និង ?page=
    protected function perPage(Request $request): int
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page'     => 'nullable|integer|min:1',
            'search'   => 'nullable|string|max:100',
        ]);

        return (int) $request->input('per_page', 15);
    }

    // បំលែង ?search= ទៅជា pattern LIKE ('%' និង '_' ត្រូវ escape)
    protected function likePattern(string $search): string
    {
        return '%' . addcslashes($search, '%_\\') . '%';
    }
}
