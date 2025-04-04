<?php
/*
Plugin Name: ChatGPT Popup for Gravity Forms
Description: A plugin to connect to ChatGPT API and display the response in a popup modal for Gravity Forms.
Version: 1.0
Author: Chris McGinnis
*/
// Enqueue styles and scripts
function chatgpt_enqueue_scripts() {
    wp_enqueue_style('chatgpt-popup-style', plugin_dir_url(__FILE__) . 'assets/css/chatgpt-gf.css', array(), '1.1.19');
	wp_enqueue_style('chatgpt-animate-text-style', plugin_dir_url(__FILE__) . 'assets/css/jquery.animatedheadline.css', array(), '1.2.1');
    wp_enqueue_script('chatgpt-popup-script', plugin_dir_url(__FILE__) . 'assets/js/chatgpt-gf.js', array('jquery'), '1.23', true);
	wp_enqueue_script('chatgpt-animate-text', plugin_dir_url(__FILE__) . 'assets/js/jquery.animatedheadline.min.js', array('jquery'), '1.23', true);
	wp_enqueue_script('chatgpt-animate-main', plugin_dir_url(__FILE__) . 'assets/js/animatemain.js', array('jquery'), '1.23', true);
    wp_localize_script('chatgpt-popup-script', 'chatgpt_ajax_object', array('ajax_url' => admin_url('admin-ajax.php')));
	wp_enqueue_script( 'fontawesome-js', 'https://kit.fontawesome.com/ac76510d8b.js', array('jquery'), '1.10.0', true );
}
add_action('wp_enqueue_scripts', 'chatgpt_enqueue_scripts');


// AJAX handler function for ChatGPT API call
function chatgpt_ajax_handler($indepth) {
    $api_key = 'KEY HERE';
    $question = sanitize_text_field($_POST['question']);
    $counter = $_POST['counter'];
    $api_url = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
    $headers = array(
        'Content-Type' => 'application/json',
        'Authorization' => 'Bearer ' . $api_key
    );
	
	
	/*
    $body = json_encode(array(
        'prompt' => 'Enhance this phrase into a question only:  "' . $question . '"',
        'max_tokens' => 100,
        'n' => 1,
        'stop' => null,
        'temperature' => 0.75
    ));

    $args = array(
        'headers' => $headers,
        'body' => $body,
        'method' => 'POST',
        'data_format' => 'body',
    );

    $response = wp_remote_post($api_url, $args);
    $response_body = json_decode(wp_remote_retrieve_body($response), true);
    $enhance = $response_body['choices'][0]['text'];
	*/

	
	if($counter==1) {
    $body = json_encode(array(
        'prompt' => "Please try and include a in-depth response to the question '" . $question . "'" . " Remember to go in-depth and add as much possible information.",
        'max_tokens' => 1000,
        'n' => 1,
        'stop' => ">>>",
        'temperature' => 0.75
    ));
	}else{
	    $body = json_encode(array(
         'prompt' => "Please try and include a in-depth response to the question '" . $question,
        'max_tokens' => 1000,
        'n' => 1,
        'stop' => ">>>",
        'temperature' => 0.8
    ));	
	}
	

    $args = array(
        'headers' => $headers,
        'body' => $body,
        'method' => 'POST',
        'data_format' => 'body',
		'timeout' => 60,
    );

    $response = wp_remote_post($api_url, $args);
    $response_body = json_decode(wp_remote_retrieve_body($response), true);
	//print_r($response_body);
	//exit();
    $answer = $response_body['choices'][0]['text'];
    echo $answer;
    //print_r($response_body);
    wp_die();
}
add_action('wp_ajax_chatgpt_ajax', 'chatgpt_ajax_handler');
add_action('wp_ajax_nopriv_chatgpt_ajax', 'chatgpt_ajax_handler');



/* Gravity Forms Additional HTML GPT Button */
//add_filter( 'gform_field_content', 'add_html_to_gravity_form_text_fields', 10, 5 );
function add_html_to_gravity_form_text_fields( $content, $field, $value, $lead_id, $form_id ) {
    // Check if the field type is a text field
    if ( $field->type == 'textarea' ) {
		$html_id = 'input_' . $form_id . '_' . $field->id;
        // Define your additional HTML content
        $additional_html = '<a href="#" data-field-id="'.$html_id.'" data-field="'.$field->label.'" class="chatgpt-popup-open">Launch Writing Assistant</a>';

        // Append the additional HTML to the field content
        $content .= $additional_html;
    }

    // Return the modified content
    return $content;
}


function chatgpt_btn( $atts ) {
    $atts = shortcode_atts( array(
        'fieldid' => '',
		'formid' => '',
		'richfield' => '',
		
    ), $atts, 'chatgptbtn' );
	
	$form_id = $atts['formid'];
	$field_id = $atts['fieldid'];
	$textarea = $atts['richfield'];
	
	if($textarea == "true") {
		$textarea = 1;
	}else{
		$textarea = 2;
	}

	$html_id = 'input_' . $form_id . '_' . $field_id;

    return '<a href="#" data-field-id="'.$html_id.'" data-field-type="'.$textarea.'" class="chatgpt-popup-open">Launch Writing Assistant</a>';
}

add_shortcode( 'chatgptbtn', 'chatgpt_btn' );
