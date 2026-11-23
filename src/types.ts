// Static free edition: callbacks are optional and never sent to a server.
export type StudyEvent={
 event_type:'lesson_open'|'concept_view'|'lab_interaction'|'answer'|'standard_open'|'standard_answer'|'active_time';
 unit_id?:string;topic?:string;standard_id?:string;correct?:boolean;seconds?:number;
};
