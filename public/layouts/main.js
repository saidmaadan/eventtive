'use strict';

$(document).ready(function(){
	$('#deleteEvent').on('click', function(e){
		deleteId = $('#deleteEvent').data('delete');
		$.ajax({
			url: '/events/delete/'+deleteId,
			type:'DELETE',
			success: function(result){

			}
		});
		window.location = '/events';
	});
});

// $(document).ready(function(){
// 	$('.myevent-name').on('mouseover',function(){
// 		$('.myevent-name').addClass('myevent-edit');
// 	});
// });