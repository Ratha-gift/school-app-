<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends AdminController
{
    // GET /admin/users?role=teacher&search=sok&per_page=20
    public function index(Request $request)
    {
        $perPage = $this->perPage($request);
        $request->validate(['role' => ['nullable', Rule::in(User::ROLES)]]);

        $users = User::query()
            ->when($request->role, fn ($q, $role) => $q->where('role', $role))
            ->when($request->search, function ($q, $search) {
                $like = $this->likePattern($search);
                $q->where(fn ($q) => $q->where('name', 'like', $like)->orWhere('email', 'like', $like));
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function store(UserRequest $request)
    {
        // password ត្រូវបាន hash ដោយ cast 'hashed' ក្នុង model User
        $user = User::create($request->validated());

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    public function show(User $user)
    {
        return new UserResource($user);
    }

    public function update(UserRequest $request, User $user)
    {
        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']); // ទុកពាក្យសម្ងាត់ចាស់
        }

        $user->update($data);

        return new UserResource($user);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->is($request->user())) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        $user->tokens()->delete(); // logout ពីគ្រប់ឧបករណ៍
        $user->delete();

        return response()->noContent();
    }
}
