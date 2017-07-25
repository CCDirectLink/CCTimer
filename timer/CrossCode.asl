state("crosscode-beta")
{
	
}

startup
{
	try{
		vars.connected = false;
		vars.started = false;
		vars.split = false;
		vars.gameTime = TimeSpan.Zero;
		System.Net.Sockets.TcpListener listener = new System.Net.Sockets.TcpListener(12346);
		vars.listener = listener;
		
		listener.Start();
		
		Action accept = null;
		accept = () => 
		{
			listener.BeginAcceptSocket(ar =>
			{
				try
				{
					System.Net.Sockets.TcpClient client = listener.EndAcceptTcpClient(ar);
					vars.connected = true;
					
					System.IO.StreamReader reader = new System.IO.StreamReader(client.GetStream());
					var exit = false;
					while (!exit)
					{
						string cmd = reader.ReadLine();
						switch(cmd[0] - '0')
						{
							case 0:
								client.Close();
								vars.started = false;
								vars.connected = false;
								exit = true;
								break;
							case 1:
								vars.started = true;
								break;
							case 2:
								vars.split = true;
								break;
							case 3:
								vars.gameTime = TimeSpan.FromSeconds(double.Parse(cmd.Replace(',', '.').Substring(1), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture));
								break;
						}
					}
				}
				catch(System.IO.IOException)
				{
					accept();
				}
				catch (Exception ex)
				{
					System.Windows.Forms.MessageBox.Show("An exception occured: " + ex.ToString());
				}
			}, null);
		};
		
		accept();
	}catch (Exception ex){
		System.Windows.Forms.MessageBox.Show("An exception occured: " + ex.ToString());
	}
}

shutdown
{
	try{
		vars.listener.Stop();
	}catch (Exception ex){
		System.Windows.Forms.MessageBox.Show("An exception occured: " + ex.ToString());
	}
}

start
{
	if(vars.started)
	{
		vars.started = false;
		return true;
	}
	return false;
}

split
{
	if(vars.split)
	{
		vars.split = false;
		return true;
	}
	return false;
}

update
{
	return true;
}

isLoading
{
	return true;
}

gameTime
{
	return vars.gameTime;
}