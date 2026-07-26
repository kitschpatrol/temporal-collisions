<?php

//error_reporting(E_ALL);
include('phpFlickr/phpFlickr.php');

if (isset($_POST['time'])) {
	$selected_time = $_POST['time'];
	$selected_photos = unserialize(urldecode($_POST['image_list']));
}


$api_key = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// Create new phpFlickr object
$fapi = new phpFlickr($api_key);

// get list of recent images
$photos = $fapi->photos_getRecent('date_upload,url_sq,url_s', 500);
$photo_count = count($photos['photo']);




// harvest a list of times
$time_list = array();

$time_count = array(); 

foreach ($photos['photo'] as $index => $photo) {
	$time_list[$index] = $photo['dateupload'];
	
	// keep track of how many images we have at each instant
	if(isset($time_count[$photo['dateupload']])) {
		$time_count[$photo['dateupload']] += 1;
	}
	else {
		$time_count[$photo['dateupload']] = 1;
	}
	
	
}

$time_list = array_reverse(array_unique($time_list));

?>



<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
	<head>
		<title>Temporal Collisions</title>
		<style type="text/css">

			html { }		
			body { }

		</style>
	</head>
	<body>
		<?php
		if (isset($_POST['time'])) {
		
			// print any matching photos
			print 'Images posted at ' . date('g:i:s A', $selected_time) . '<br />';
			
			foreach ($selected_photos['photo'] as $photo) {
				if($photo['dateupload'] == $selected_time) {
					print '<a href="http://www.flickr.com/photos/' . $photo['owner'] . '/' . $photo['id'] . '"><img src="' . $photo['url_s'] . '" /></a>';				
				}
			}
		
			print '<br/><br/>';
		
		 }
		?>
	
		Pick a recent time:<br>
		<form method="post">
		
			<select name="time">
			<?php
				foreach ($time_list as $time) {
					print '<option value="' . $time .'" />' . date('g:i:s A', $time) . ' (' . $time_count[$time] .  ' images)</option>';
				}
			?>
			</select>
			<input type="hidden" name="image_list" value="<?php print urlencode(serialize($photos)); ?>" />
			<input type="submit" value="hit me" />
		</form>		
		
	</body>
</html>
