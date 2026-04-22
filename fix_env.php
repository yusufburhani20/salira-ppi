<?php
$c = file_get_contents('.env');
$c = preg_replace('/[\x00]/', '', $c); // Remove null bytes
$c = str_replace([
    " M I D T R A N S _ S E R V E R _ K E Y = \r\n",
    " M I D T R A N S _ C L I E N T _ K E Y = \r\n",
    " M I D T R A N S _ I S _ P R O D U C T I O N = f a l s e \r\n",
    " M I D T R A N S _ I S _ S A N I T I Z E D = t r u e \r\n",
    " M I D T R A N S _ I S _ 3 D S = t r u e \r\n",
    "\n ÿþ"
], '', $c);
$c = preg_replace('/M I D T R A N S.*\n?/m', '', $c); // Strip anything looking like spaced midtrans
file_put_contents('.env', trim($c) . "\n\nMIDTRANS_SERVER_KEY=\nMIDTRANS_CLIENT_KEY=\nMIDTRANS_IS_PRODUCTION=false\nMIDTRANS_IS_SANITIZED=true\nMIDTRANS_IS_3DS=true\n");
echo "Done";
