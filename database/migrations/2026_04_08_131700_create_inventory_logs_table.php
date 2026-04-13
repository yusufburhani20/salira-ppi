<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->foreignId('barcode_id')->nullable()->constrained('inventory_barcodes')->onDelete('set null');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('action', ['masuk', 'keluar', 'pinjam', 'kembali', 'perbaikan', 'pemusnahan']);
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
