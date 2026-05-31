<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\AcademicClass;
use App\Models\StudentAttendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PresenceScannerControllerTest extends TestCase
{
    use RefreshDatabase;

    private $student;
    private $class;

    protected function setUp(): void
    {
        parent::setUp();

        // Create standard academic class
        $this->class = AcademicClass::create([
            'name' => 'X IPA 1',
        ]);

        // Create student
        $this->student = Student::create([
            'nis' => 'S001',
            'nisn' => '1234567890',
            'name' => 'Budi Santoso',
            'gender' => 'L',
            'status' => 'active',
        ]);

        // Attach student to class
        $this->student->academicClasses()->attach($this->class->id, ['is_active' => true]);
    }

    /**
     * Test scanning using a valid manual NIS.
     */
    public function test_scan_with_manual_nis(): void
    {
        $response = $this->postJson(route('portal.attendance.scan'), [
            'nis' => 'S001',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Presensi berhasil dicatat!',
            'data' => [
                'student_name' => 'Budi Santoso',
                'class_name' => 'X IPA 1',
            ]
        ]);

        $this->assertDatabaseHas('student_attendances', [
            'student_id' => $this->student->id,
            'status' => 'hadir',
        ]);
    }

    /**
     * Test scanning using a valid dynamic qr_token (from camera).
     */
    public function test_scan_with_valid_qr_token(): void
    {
        $timestamp = time();
        $signature = hash_hmac('sha256', "S001:{$timestamp}", config('app.key'));
        $qrToken = base64_encode("S001:{$timestamp}:{$signature}");

        $response = $this->postJson(route('portal.attendance.scan'), [
            'qr_token' => $qrToken,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Presensi berhasil dicatat!',
            'data' => [
                'student_name' => 'Budi Santoso',
                'class_name' => 'X IPA 1',
            ]
        ]);
    }

    /**
     * Test scanning using a valid barcode scanner input containing base64 token in 'nis' parameter.
     */
    public function test_scan_with_base64_in_nis_parameter_from_barcode_scanner(): void
    {
        $timestamp = time();
        $signature = hash_hmac('sha256', "S001:{$timestamp}", config('app.key'));
        $qrToken = base64_encode("S001:{$timestamp}:{$signature}");

        // Simulating the physical scanner sending the base64 token under the 'nis' field
        $response = $this->postJson(route('portal.attendance.scan'), [
            'nis' => $qrToken,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Presensi berhasil dicatat!',
            'data' => [
                'student_name' => 'Budi Santoso',
                'class_name' => 'X IPA 1',
            ]
        ]);
    }

    /**
     * Test scanning using a valid 8-character short signature token.
     */
    public function test_scan_with_short_signature_succeeds(): void
    {
        $timestamp = time();
        $fullSignature = hash_hmac('sha256', "S001:{$timestamp}", config('app.key'));
        $signature = substr($fullSignature, 0, 8);
        $qrToken = base64_encode("S001:{$timestamp}:{$signature}");

        $response = $this->postJson(route('portal.attendance.scan'), [
            'qr_token' => $qrToken,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Presensi berhasil dicatat!',
            'data' => [
                'student_name' => 'Budi Santoso',
                'class_name' => 'X IPA 1',
            ]
        ]);
    }

    /**
     * Test scanning with an invalid signature in the token for a non-existent student.
     */
    public function test_scan_with_invalid_signature_fails(): void
    {
        $timestamp = time();
        $qrToken = base64_encode("S999:{$timestamp}:invalid_signature");

        $response = $this->postJson(route('portal.attendance.scan'), [
            'qr_token' => $qrToken,
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Token keamanan tidak valid.',
        ]);
    }

    /**
     * Test scanning with an invalid signature but for an existing student (signature discrepancy resilience).
     */
    public function test_scan_with_invalid_signature_but_existing_student_succeeds(): void
    {
        $timestamp = time();
        $qrToken = base64_encode("S001:{$timestamp}:invalid_signature");

        $response = $this->postJson(route('portal.attendance.scan'), [
            'qr_token' => $qrToken,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Presensi berhasil dicatat!',
            'data' => [
                'student_name' => 'Budi Santoso',
            ]
        ]);
    }

    /**
     * Test scanning with a manual NIS that happens to look like base64 but has invalid signature,
     * it should fall back to treating it as direct NIS and succeed if student exists.
     */
    public function test_scan_with_manual_nis_resembling_base64_falls_back(): void
    {
        // "UzA0MQ==" is base64 for "S041" (without colon and 3 parts, wait)
        // Let's create a base64 looking string with 3 parts e.g. "UzA0MToxOjI=" which is "S041:1:2"
        // Let's register a student with NIS "UzA0MToxOjI="
        $weirdStudent = Student::create([
            'nis' => 'UzA0MToxOjI=',
            'nisn' => '0987654321',
            'name' => 'Weird Name Student',
            'gender' => 'P',
            'status' => 'active',
        ]);
        $weirdStudent->academicClasses()->attach($this->class->id, ['is_active' => true]);

        $response = $this->postJson(route('portal.attendance.scan'), [
            'nis' => 'UzA0MToxOjI=',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'student_name' => 'Weird Name Student',
            ]
        ]);
    }
}
