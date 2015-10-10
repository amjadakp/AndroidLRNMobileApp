package com.symphonyteleca.lrn.catalyst.download.error;

public final class FileExtractionIOException extends DownloadException {

	/**
	 * 
	 */
	// private static final long serialVersionUID = 1L;

	public FileExtractionIOException(String message) {

		super(message);
	}

	public FileExtractionIOException(String message, int extra) {
		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}
