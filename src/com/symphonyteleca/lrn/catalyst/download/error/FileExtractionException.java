package com.symphonyteleca.lrn.catalyst.download.error;

public final class FileExtractionException extends DownloadException {
	private static final long serialVersionUID = 1L;

	public FileExtractionException(String message) {

		super(message);
	}

	public FileExtractionException(String message, int extra) {
		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}
