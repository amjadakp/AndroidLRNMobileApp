package com.symphonyteleca.lrn.catalyst.download.utils;

public final class MyIntents {

	public static final String MAP = "MAP";
	public static final String TYPE = "type";
	public static final String PROCESS_SPEED = "process_speed";
	public static final String PROCESS_PROGRESS = "process_progress";
	public static final String URL = "url";
	public static final String ERROR_CODE = "error_code";
	public static final String ERROR_INFO = "error_info";
	public static final String IS_PAUSED = "is_paused";
	public static final String IS_COMPLETED = "is_completed";
	public static final String PATH = "file_path";
	public static final String NAME = "file_name";
	public static final String TASKNAME = "taskName";
	public static final String GLOBAL_PROCESS_SPEED = "global_process_speed";
	public static final String GLOBAL_PROCESS_PROGRESS = "global_process_progress";

	public class Types {

		public static final int INTERRUPT = -1;
		public static final int COMPLETE = 1;

		public static final int START = 2;
		public static final int PAUSE = 3;
		public static final int DELETE = 4;
		public static final int RESUME = 5;
		public static final int ADD = 6;
		public static final int STOP = 7;
		public static final int EXTRACT = 8;
		public static final int CANCEL = 9;
		public static final int OPEN = 10;
		public static final int EXCEPTION = 11;
		public static final int ADDALL = 12;
		public static final int NOT_STARTED = 13;
	}

}
