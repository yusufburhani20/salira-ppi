<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StockOpnameReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pdfData;
    public $dateRange;
    public $notes;
    public $senderName;

    /**
     * Create a new message instance.
     */
    public function __construct($pdfData, $dateRange, $notes, $senderName)
    {
        $this->pdfData = $pdfData;
        $this->dateRange = $dateRange;
        $this->notes = $notes;
        $this->senderName = $senderName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Laporan Mingguan Stock Opname Lab Komputer - SALIRA',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.stock_opname_email',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfData, 'laporan-stock-opname-' . str_replace(' ', '_', $this->dateRange) . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
