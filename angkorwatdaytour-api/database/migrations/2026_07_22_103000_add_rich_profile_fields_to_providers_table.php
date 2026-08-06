<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->string('slug', 150)->nullable()->after('id');
            $table->string('tagline', 255)->nullable()->after('business_name');
            $table->unsignedSmallInteger('founded_year')->nullable()->after('bio');
            $table->unsignedSmallInteger('team_size')->nullable()->after('founded_year');
            $table->json('spoken_languages')->nullable()->after('team_size');
            $table->text('certifications')->nullable()->after('spoken_languages');
            $table->text('specialties')->nullable()->after('certifications');
            $table->string('website_url', 255)->nullable()->after('specialties');
            $table->string('phone', 50)->nullable()->after('website_url');
            $table->string('whatsapp', 50)->nullable()->after('phone');
            $table->string('logo_url', 255)->nullable()->after('whatsapp');
            $table->string('cover_image_url', 255)->nullable()->after('logo_url');
        });

        // Backfill unique slugs for existing providers before adding unique index.
        $used = [];
        DB::table('providers')->orderBy('id')->each(function ($provider) use (&$used) {
            $base = Str::slug($provider->business_name ?: 'provider-' . $provider->id);
            $slug = $base;
            $counter = 1;
            while (in_array($slug, $used, true)) {
                $slug = $base . '-' . $counter++;
            }
            $used[] = $slug;
            DB::table('providers')->where('id', $provider->id)->update(['slug' => $slug]);
        });

        Schema::table('providers', function (Blueprint $table) {
            $table->string('slug', 150)->unique()->change();
        });
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->dropColumn([
                'slug',
                'tagline',
                'founded_year',
                'team_size',
                'spoken_languages',
                'certifications',
                'specialties',
                'website_url',
                'phone',
                'whatsapp',
                'logo_url',
                'cover_image_url',
            ]);
        });
    }
};
