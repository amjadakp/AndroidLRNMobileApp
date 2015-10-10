package com.symphonyteleca.lrn.catalyst.download.error;

public final class FileAlreadyExistException extends DownloadException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public FileAlreadyExistException(String message) {

		super(message);
	}

	public FileAlreadyExistException(String message, int extra) {
		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}